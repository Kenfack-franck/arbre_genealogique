// src/app/family/new/page.tsx et src/app/family/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFamily } from '@/context/FamilyContext';
import { Family } from '@/lib/models/Families';

export default function FamilyFormPage() {
  const params = useParams();
  const router = useRouter();
  const { families, loading, addFamily, updateFamily } = useFamily();
  const [isNew, setIsNew] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Déterminer si c'est un ajout ou une modification
  useEffect(() => {
    const id = params?.id;
    setIsNew(!id);
    
    if (!isNew && !loading && id) {
      // Trouver la famille à modifier
      const family = families.find(f => f.id === id);
      
      if (family) {
        setFormData({
          name: family.name,
          description: family.description
        });
      } else {
        // Famille non trouvée, rediriger
        router.push('/family');
      }
    }
  }, [params, families, loading, isNew, router]);

  // Gestionnaire de changement de champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Le nom de l'arbre généalogique est requis";
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
      if (isNew) {
        // Création d'un nouvel arbre généalogique
        const newFamily: Family = {
          id: `family-${Date.now()}`,
          name: formData.name,
          description: formData.description,
          persons: [],
          relationships: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await addFamily(newFamily);
        
        // Rediriger vers la page de l'arbre
        router.push(`/family/${newFamily.id}`);
      } else if (params?.id) {
        // Mise à jour de l'arbre existant
        await updateFamily(params.id as string, {
          name: formData.name,
          description: formData.description
        });
        
        // Rediriger vers la page de l'arbre
        router.push(`/family/${params.id}`);
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
        <Link href={isNew ? "/family" : `/family/${params?.id}`} className="text-blue-600 hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          {isNew ? "Créer un nouvel arbre généalogique" : `Modifier ${formData.name}`}
        </h1>
        
        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="name" className="form-label">
              Nom de l'arbre généalogique <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'border-red-500 ring-1 ring-red-500' : ''}`}
              placeholder="Ex: Famille Dupont"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows={4}
              placeholder="Description optionnelle de l'arbre généalogique"
            />
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <Link 
              href={isNew ? "/family" : `/family/${params?.id}`}
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
                isNew ? 'Créer l\'arbre' : 'Enregistrer les modifications'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}