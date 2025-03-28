// src/app/relationship/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFamily } from '@/context/FamilyContext';
import { Person } from '@/lib/models/Person';
import { Relationship, RelationType, RelationSubType } from '@/lib/models/Relationship';
import { Family } from '@/lib/models/Families';

export default function NewRelationshipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { families, activeFamily, loading, addRelationship } = useFamily();
  
  // Récupérer les paramètres de recherche
  const type = searchParams.get('type') as RelationType || 'parent';
  const sourceId = searchParams.get('sourceId');
  const targetId = searchParams.get('targetId');
  const familyIdParam = searchParams.get('familyId');
  
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  
  // États du formulaire
  const [formData, setFormData] = useState<{
    type: RelationType;
    sourceId: string;
    targetId: string;
    sousType: RelationSubType;
    dateDebut: string;
    dateFin: string;
    existingPerson: boolean;
  }>({
    type: type || 'parent',
    sourceId: sourceId || '',
    targetId: targetId || '',
    sousType: type === 'parent' ? 'pere' : type === 'conjoint' ? 'marie' : 'biologique',
    dateDebut: '',
    dateFin: '',
    existingPerson: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sourcePerson, setSourcePerson] = useState<Person | null>(null);
  const [targetPerson, setTargetPerson] = useState<Person | null>(null);
  const [availablePersons, setAvailablePersons] = useState<Person[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Déterminer la famille actuelle
  useEffect(() => {
    if (!loading && families.length > 0) {
      let family: Family | null = null;
      
      if (familyIdParam) {
        family = families.find(f => f.id === familyIdParam) || null;
      } else if (activeFamily) {
        family = activeFamily;
      }
      
      setCurrentFamily(family);
      
      if (family) {
        setAvailablePersons(family.persons);
        
        // Trouver les personnes source et cible si leurs IDs sont fournis
        if (sourceId) {
          const person = family.persons.find(p => p.id === sourceId);
          if (person) setSourcePerson(person);
        }
        
        if (targetId) {
          const person = family.persons.find(p => p.id === targetId);
          if (person) setTargetPerson(person);
        }
      }
    }
  }, [loading, families, activeFamily, familyIdParam, sourceId, targetId]);
  
  // Initialiser le formulaire en fonction du type de relation et des IDs fournis
  useEffect(() => {
    if (currentFamily) {
      // Si c'est une relation parent et qu'il n'y a pas de sourceId défini
      // mais qu'il y a un targetId (enfant), on pré-remplit targetId
      if (type === 'parent' && !sourceId && targetId) {
        setFormData(prev => ({
          ...prev,
          type: 'parent',
          targetId: targetId
        }));
      }
      
      // Si c'est une relation enfant et qu'il y a un sourceId (parent)
      // mais pas de targetId défini, on pré-remplit sourceId
      if ((type === 'enfant' || type === 'child') && sourceId && !targetId) {
        setFormData(prev => ({
          ...prev,
          type: 'parent', // On utilise le type 'parent' car c'est la même relation vue différemment
          sourceId: sourceId
        }));
      }
    }
  }, [currentFamily, type, sourceId, targetId]);
  
  // Gestionnaire de changement de champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si on change le type de relation, mettre à jour le sous-type
    if (name === 'type') {
        setFormData(prev => ({
          ...prev,
          sousType: value === 'parent' ? 'pere' : value === 'conjoint' ? 'marie' : 'biologique'
        }));
      }
      
      // Si on change la personne source ou cible
      if (name === 'sourceId' && value && currentFamily) {
        const person = currentFamily.persons.find(p => p.id === value);
        if (person) setSourcePerson(person);
      }
      
      if (name === 'targetId' && value && currentFamily) {
        const person = currentFamily.persons.find(p => p.id === value);
        if (person) setTargetPerson(person);
      }
      
      // Effacer l'erreur si elle existe
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    };
    
    // Changement du mode (personne existante ou nouvelle)
    const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        existingPerson: e.target.value === 'existing'
      }));
    };
    
    // Validation du formulaire
    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.type) {
        newErrors.type = "Le type de relation est requis";
      }
      
      if (!formData.sourceId) {
        newErrors.sourceId = formData.type === 'parent' ? "Le parent est requis" : "La première personne est requise";
      }
      
      if (!formData.targetId) {
        newErrors.targetId = formData.type === 'parent' ? "L'enfant est requis" : "La seconde personne est requise";
      }
      
      if (formData.sourceId === formData.targetId) {
        newErrors.targetId = "Une personne ne peut pas être en relation avec elle-même";
      }
      
      // Vérifier si la relation existe déjà
      if (currentFamily && formData.sourceId && formData.targetId) {
        const relationExists = currentFamily.relationships.some(rel => 
          rel.type === formData.type && 
          rel.sourceId === formData.sourceId && 
          rel.targetId === formData.targetId
        );
        
        if (relationExists) {
          newErrors.submit = "Cette relation existe déjà";
        }
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    
    // Soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!currentFamily) {
        setErrors({
          submit: "Aucun arbre généalogique sélectionné"
        });
        return;
      }
      
      if (!validateForm()) return;
      
      setIsSaving(true);
      
      try {
        // Générer un ID unique pour la relation
        const newRelationId = `rel-${Date.now()}`;
        
        // Créer la nouvelle relation
        const newRelation: Relationship = {
          id: newRelationId,
          type: formData.type,
          sourceId: formData.sourceId,
          targetId: formData.targetId,
          sousType: formData.sousType,
          dateDebut: formData.dateDebut || null,
          dateFin: formData.dateFin || null
        };
        
        // Ajouter la relation à la famille
        await addRelationship(currentFamily.id, newRelation);
        
        // Rediriger vers la page de la personne cible ou source selon le contexte
        if (formData.type === 'parent') {
          router.push(`/person/${formData.targetId}?familyId=${currentFamily.id}`); // Rediriger vers l'enfant
        } else {
          router.push(`/person/${formData.sourceId}?familyId=${currentFamily.id}`); // Rediriger vers la première personne
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
    
    // Obtenir le libellé approprié pour les personnes source et cible selon le type de relation
    const getLabels = () => {
      switch (formData.type) {
        case 'parent':
          return { source: 'Parent', target: 'Enfant' };
        case 'conjoint':
          return { source: 'Personne 1', target: 'Personne 2 (conjoint)' };
        default:
          return { source: 'Personne 1', target: 'Personne 2' };
      }
    };
    
    const labels = getLabels();
  
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
  
    if (!currentFamily) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">Aucun arbre généalogique sélectionné</h2>
            <p className="mb-6">Veuillez sélectionner un arbre généalogique pour ajouter une relation.</p>
            <Link href="/family" className="btn btn-primary">
              Voir mes arbres généalogiques
            </Link>
          </div>
        </div>
      );
    }
  
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href={
              sourceId ? 
                `/person/${sourceId}?familyId=${currentFamily.id}` : 
                targetId ? 
                  `/person/${targetId}?familyId=${currentFamily.id}` : 
                  `/person?familyId=${currentFamily.id}`
            } 
            className="text-blue-600 hover:underline inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Retour
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">
            Ajouter une nouvelle relation
          </h1>
          
          {sourcePerson && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="font-semibold text-blue-800 mb-2">
                {formData.type === 'parent' ? 'Parent' : 'Personne 1'}
              </h2>
              <p>{sourcePerson.prenom} {sourcePerson.nom}</p>
            </div>
          )}
          
          {targetPerson && formData.type === 'parent' && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="font-semibold text-green-800 mb-2">Enfant</h2>
              <p>{targetPerson.prenom} {targetPerson.nom}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.submit}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="type" className="form-label">Type de relation</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-input"
              >
                <option value="parent">Parent-Enfant</option>
                <option value="conjoint">Conjoint</option>
              </select>
            </div>
            
            {/* Sélection de la personne source si elle n'est pas déjà définie */}
            {!sourceId && (
              <div className="mb-6">
                <label htmlFor="sourceId" className="form-label">
                  {labels.source} <span className="text-red-500">*</span>
                </label>
                <select
                  id="sourceId"
                  name="sourceId"
                  value={formData.sourceId}
                  onChange={handleChange}
                  className={`form-input ${errors.sourceId ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  required
                >
                  <option value="">Sélectionner une personne</option>
                  {availablePersons.map(person => (
                    <option 
                      key={person.id} 
                      value={person.id}
                      disabled={person.id === formData.targetId}
                    >
                      {person.prenom} {person.nom}
                    </option>
                  ))}
                </select>
                {errors.sourceId && (
                  <p className="text-red-500 text-sm mt-1">{errors.sourceId}</p>
                )}
              </div>
            )}
            
            {/* Sélection de la personne cible si elle n'est pas déjà définie */}
            {!targetId && (
              <div className="mb-6">
                <label htmlFor="targetId" className="form-label">
                  {labels.target} <span className="text-red-500">*</span>
                </label>
                
                <div className="mb-4">
                  <div className="flex items-center space-x-4 mb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="personMode"
                        value="existing"
                        checked={formData.existingPerson}
                        onChange={handleModeChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Personne existante</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="personMode"
                        value="new"
                        checked={!formData.existingPerson}
                        onChange={handleModeChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Créer une nouvelle personne</span>
                    </label>
                  </div>
                </div>
                
                {formData.existingPerson ? (
                  // Sélectionner une personne existante
                  <select
                    id="targetId"
                    name="targetId"
                    value={formData.targetId}
                    onChange={handleChange}
                    className={`form-input ${errors.targetId ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    required
                  >
                    <option value="">Sélectionner une personne</option>
                    {availablePersons.map(person => (
                      <option 
                        key={person.id} 
                        value={person.id}
                        disabled={person.id === formData.sourceId}
                      >
                        {person.prenom} {person.nom}
                      </option>
                    ))}
                  </select>
                ) : (
                  // Créer une nouvelle personne avec un lien vers le formulaire
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 mb-3">
                      Vous allez créer une nouvelle personne à relier.
                    </p>
                    <Link
                      href={`/person/new?familyId=${currentFamily.id}&returnTo=${encodeURIComponent(`/relationship/new?type=${formData.type}&sourceId=${formData.sourceId}&familyId=${currentFamily.id}`)}`}
                      className="btn btn-primary"
                    >
                      Créer une nouvelle personne
                    </Link>
                  </div>
                )}
                
                {errors.targetId && (
                  <p className="text-red-500 text-sm mt-1">{errors.targetId}</p>
                )}
              </div>
            )}
            
            {/* Sous-type de relation */}
            <div className="mb-6">
              <label htmlFor="sousType" className="form-label">Type spécifique</label>
              <select
                id="sousType"
                name="sousType"
                value={formData.sousType}
                onChange={handleChange}
                className="form-input"
              >
                {formData.type === 'parent' && (
                  <>
                    <option value="pere">Père</option>
                    <option value="mere">Mère</option>
                    <option value="adoptif">Parent adoptif</option>
                  </>
                )}
                
                {formData.type === 'conjoint' && (
                  <>
                    <option value="marie">Marié(e)</option>
                    <option value="non_marie">Non marié(e)</option>
                  </>
                )}
              </select>
            </div>
            
            {/* Date de début (mariage, adoption, etc.) */}
            {formData.type === 'conjoint' && (
              <div className="mb-6">
                <label htmlFor="dateDebut" className="form-label">Date de mariage/union</label>
                <input
                  type="date"
                  id="dateDebut"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            )}
            
            {/* Date de fin (divorce, etc.) */}
            {formData.type === 'conjoint' && formData.sousType === 'marie' && (
              <div className="mb-6">
                <label htmlFor="dateFin" className="form-label">Date de divorce/séparation (si applicable)</label>
                <input
                  type="date"
                  id="dateFin"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-4 mt-8">
              <Link 
                href={
                  sourceId ? 
                    `/person/${sourceId}?familyId=${currentFamily.id}` : 
                    targetId ? 
                      `/person/${targetId}?familyId=${currentFamily.id}` : 
                      `/person?familyId=${currentFamily.id}`
                }
                className="btn btn-secondary"
              >
                Annuler
              </Link>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || !formData.existingPerson}
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer la relation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }