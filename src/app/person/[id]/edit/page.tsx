// src/app/person/[id]/edit/page.tsx et src/app/person/new/page.tsx (même composant réutilisé)
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFamily } from '@/context/FamilyContext';
import { Person } from '@/lib/models/Person';

export default function PersonFormPage() {
  const params = useParams();
  const router = useRouter();
  const { familyTree, loading, setFamilyTree } = useFamily();
  const [isNew, setIsNew] = useState(true);
  const [formData, setFormData] = useState<Partial<Person>>({
    nom: '',
    prenom: '',
    sexe: 'M',
    birthDate: '',
    deathDate: '',
    etat: 'vivant'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Déterminer si c'est un ajout ou une modification
  useEffect(() => {
    const id = params?.id;
    setIsNew(!id);
    
    if (id && !loading && familyTree) {
      const existingPerson = familyTree.persons.find(p => p.id === id);
      if (existingPerson) {
        setFormData({
          ...existingPerson,
          birthDate: existingPerson.birthDate || '',
          deathDate: existingPerson.deathDate || ''
        });
      } else {
        // Personne non trouvée, rediriger
        router.push('/person');
      }
    }
  }, [params, familyTree, loading, router]);

  // Gestionnaire de changement de champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur si elle existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Activer/désactiver la date de décès en fonction de l'état (vivant/mort)
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'vivant' | 'mort';
    
    setFormData(prev => ({
      ...prev,
      etat: value,
      // Réinitialiser la date de décès si la personne est marquée comme vivante
      deathDate: value === 'vivant' ? '' : prev.deathDate
    }));
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom?.trim()) {
      newErrors.nom = "Le nom est requis";
    }
    
    if (!formData.prenom?.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }
    
    if (formData.birthDate && formData.deathDate) {
      const birth = new Date(formData.birthDate);
      const death = new Date(formData.deathDate);
      
      if (birth > death) {
        newErrors.deathDate = "La date de décès doit être postérieure à la date de naissance";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      if (!familyTree) throw new Error("Données de l'arbre non disponibles");
      
      const updatedTree = { ...familyTree };
      
      if (isNew) {
        // Générer un nouvel ID
        const newId = `p${Date.now()}`;
        
        // Ajouter la nouvelle personne
        const newPerson: Person = {
          id: newId,
          nom: formData.nom || '',
          prenom: formData.prenom || '',
          sexe: formData.sexe as 'M' | 'F' | 'A',
          birthDate: formData.birthDate || null,
          deathDate: formData.deathDate || null,
          etat: formData.etat as 'vivant' | 'mort'
        };
        
        updatedTree.persons = [...updatedTree.persons, newPerson];
        updatedTree.metadata.dateMiseAJour = new Date().toISOString();
        
        await setFamilyTree(updatedTree);
        
        // Rediriger vers la page de détail de la nouvelle personne
        router.push(`/person/${newId}`);
      } else {
        // Mise à jour d'une personne existante
        const personId = params?.id as string;
        
        updatedTree.persons = updatedTree.persons.map(p => 
          p.id === personId 
            ? {
                ...p,
                nom: formData.nom || '',
                prenom: formData.prenom || '',
                sexe: formData.sexe as 'M' | 'F' | 'A',
                birthDate: formData.birthDate || null,
                deathDate: formData.deathDate || null,
                etat: formData.etat as 'vivant' | 'mort'
              }
            : p
        );
        
        updatedTree.metadata.dateMiseAJour = new Date().toISOString();
        
        await setFamilyTree(updatedTree);
        
        // Rediriger vers la page de détail de la personne mise à jour
        router.push(`/person/${personId}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors(prev => ({
        ...prev,
        submit: "Une erreur est survenue lors de la sauvegarde"
      }));
    } finally {
      setIsSaving(false);
    }
  };

  // Suppression d'une personne
  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette personne ? Cette action est irréversible.')) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (!familyTree) throw new Error("Données de l'arbre non disponibles");
      
      const personId = params?.id as string;
      
      // Suppression des relations associées
      const updatedRelationships = familyTree.relationships.filter(
        rel => rel.sourceId !== personId && rel.targetId !== personId
      );
      
      // Suppression de la personne
      const updatedPersons = familyTree.persons.filter(p => p.id !== personId);
      
      const updatedTree = {
        ...familyTree,
        persons: updatedPersons,
        relationships: updatedRelationships,
        metadata: {
          ...familyTree.metadata,
          dateMiseAJour: new Date().toISOString()
        }
      };
      
      await setFamilyTree(updatedTree);
      
      // Rediriger vers la liste des personnes
      router.push('/person');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setErrors(prev => ({
        ...prev,
        submit: "Une erreur est survenue lors de la suppression"
      }));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement des données...</h2>
          <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={isNew ? "/person" : `/person/${params?.id}`} className="text-blue-600 hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          {isNew ? "Ajouter une nouvelle personne" : `Modifier ${formData.prenom} ${formData.nom}`}
        </h1>
        
        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Prénom */}
            <div>
              <label htmlFor="prenom" className="form-label">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom || ''}
                onChange={handleChange}
                className={`form-input ${errors.prenom ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                required
              />
              {errors.prenom && (
                <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>
              )}
            </div>
            
            {/* Nom */}
            <div>
              <label htmlFor="nom" className="form-label">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom || ''}
                onChange={handleChange}
                className={`form-input ${errors.nom ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                required
              />
              {errors.nom && (
                <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
              )}
            </div>
            
            {/* Sexe */}
            <div>
              <label htmlFor="sexe" className="form-label">Sexe</label>
              <select
                id="sexe"
                name="sexe"
                value={formData.sexe || 'M'}
                onChange={handleChange}
                className="form-input"
              >
                <option value="M">Homme</option>
                <option value="F">Femme</option>
                <option value="A">Autre</option>
              </select>
            </div>
            
            {/* État (vivant/mort) */}
            <div>
              <label htmlFor="etat" className="form-label">État</label>
              <select
                id="etat"
                name="etat"
                value={formData.etat || 'vivant'}
                onChange={handleStateChange}
                className="form-input"
              >
                <option value="vivant">Vivant</option>
                <option value="mort">Décédé</option>
              </select>
            </div>
            
            {/* Date de naissance */}
            <div>
              <label htmlFor="birthDate" className="form-label">Date de naissance</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            {/* Date de décès (visible seulement si état = mort) */}
            {formData.etat === 'mort' && (
              <div>
                <label htmlFor="deathDate" className="form-label">Date de décès</label>
                <input
                  type="date"
                  id="deathDate"
                  name="deathDate"
                  value={formData.deathDate || ''}
                  onChange={handleChange}
                  className={`form-input ${errors.deathDate ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
                {errors.deathDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.deathDate}</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between mt-8">
            <div>
              {!isNew && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-danger"
                  disabled={isSaving}
                >
                  Supprimer
                </button>
              )}
            </div>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link 
                href={isNew ? "/person" : `/person/${params?.id}`}
                className="btn btn-secondary"
              >
                Annuler
              </Link>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}