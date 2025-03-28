// src/context/FamilyContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FamilyTreeData } from '../lib/models/FamilyTree';
import { Family, FamiliesData } from '../lib/models/Families';
import { Person } from '../lib/models/Person';
import { Relationship } from '../lib/models/Relationship';
import { initialFamiliesData } from '@/lib/data/initialFamilyTree';


interface FamilyContextType {
  families: Family[];
  activeFamily: Family | null;
  loading: boolean;
  setActiveFamily: (familyId: string) => void;
  addFamily: (family: Family) => Promise<void>;
  updateFamily: (familyId: string, updates: Partial<Family>) => Promise<void>;
  deleteFamily: (familyId: string) => Promise<void>;
  addPerson: (familyId: string, person: Person) => Promise<void>;
  updatePerson: (familyId: string, person: Person) => Promise<void>;
  deletePerson: (familyId: string, personId: string) => Promise<void>;
  addRelationship: (familyId: string, relationship: Relationship) => Promise<void>;
  updateRelationship: (familyId: string, relationship: Relationship) => Promise<void>;
  deleteRelationship: (familyId: string, relationshipId: string) => Promise<void>;
  getAllData: () => FamiliesData;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

// Fonction pour charger les données depuis le localStorage
const loadFamiliesData = (): FamiliesData => {
  if (typeof window === 'undefined') {
    return initialFamiliesData; // Utiliser les données initiales sur le serveur
  }
  
  const data = localStorage.getItem('familiesData');
  if (!data) {
    return initialFamiliesData; // Utiliser les données initiales si rien n'est stocké
  }
  
  try {
    return JSON.parse(data) as FamiliesData;
  } catch (error) {
    console.error('Error parsing families data:', error);
    return initialFamiliesData; // En cas d'erreur, utiliser les données initiales
  }
};

// Fonction pour sauvegarder les données dans le localStorage
const saveFamiliesData = async (data: FamiliesData): Promise<void> => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('familiesData', JSON.stringify(data));
};

export const FamilyProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [familiesData, setFamiliesData] = useState<FamiliesData>({ 
    families: [], 
    activeFamilyId: null,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  
  // Charger les données au démarrage
  useEffect(() => {
    const initializeData = async () => {
      try {
        const data = loadFamiliesData();
        setFamiliesData(data);
        
        // Sauvegarder les données initiales si elles n'étaient pas déjà stockées
        if (!localStorage.getItem('familiesData')) {
          await saveFamiliesData(data);
        }
      } catch (error) {
        console.error('Failed to initialize family data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);
  
  // Obtenir la famille active
  const activeFamily = familiesData.activeFamilyId
    ? familiesData.families.find(f => f.id === familiesData.activeFamilyId) || null
    : familiesData.families.length > 0 ? familiesData.families[0] : null;
  
  // Définir la famille active
  const setActiveFamily = (familyId: string) => {
    setFamiliesData(prev => ({
      ...prev,
      activeFamilyId: familyId
    }));
    
    saveFamiliesData({
      ...familiesData,
      activeFamilyId: familyId
    });
  };
  
  // Ajouter une nouvelle famille
  const addFamily = async (family: Family) => {
    const newFamiliesData = {
      ...familiesData,
      families: [...familiesData.families, family],
      activeFamilyId: family.id,
      lastUpdated: new Date().toISOString()
    };
    
    await saveFamiliesData(newFamiliesData);
    setFamiliesData(newFamiliesData);
  };
  
  // Mettre à jour une famille existante
  const updateFamily = async (familyId: string, updates: Partial<Family>) => {
    const updatedFamilies = familiesData.families.map(f => 
      f.id === familyId
        ? { ...f, ...updates, updatedAt: new Date().toISOString() }
        : f
    );
    
    const newFamiliesData = {
      ...familiesData,
      families: updatedFamilies,
      lastUpdated: new Date().toISOString()
    };
    
    await saveFamiliesData(newFamiliesData);
    setFamiliesData(newFamiliesData);
  };
  
  // Supprimer une famille
  const deleteFamily = async (familyId: string) => {
    const updatedFamilies = familiesData.families.filter(f => f.id !== familyId);
    
    // Si on supprime la famille active, définir une autre famille comme active
    let newActiveFamilyId = familiesData.activeFamilyId;
    if (familyId === familiesData.activeFamilyId) {
      newActiveFamilyId = updatedFamilies.length > 0 ? updatedFamilies[0].id : null;
    }
    
    const newFamiliesData = {
      ...familiesData,
      families: updatedFamilies,
      activeFamilyId: newActiveFamilyId,
      lastUpdated: new Date().toISOString()
    };
    
    await saveFamiliesData(newFamiliesData);
    setFamiliesData(newFamiliesData);
  };
  
  // Ajouter une personne à une famille
  const addPerson = async (familyId: string, person: Person) => {
    const updatedFamilies = familiesData.families.map(f => 
      f.id === familyId
        ? {
            ...f,
            persons: [...f.persons, person],
            updatedAt: new Date().toISOString()
          }
        : f
    );
    
    const newFamiliesData = {
      ...familiesData,
      families: updatedFamilies,
      lastUpdated: new Date().toISOString()
    };
    
    await saveFamiliesData(newFamiliesData);
    setFamiliesData(newFamiliesData);
  };
  
  // Mettre à jour une personne dans une famille
  const updatePerson = async (familyId: string, person: Person) => {
    const updatedFamilies = familiesData.families.map(f => 
      f.id === familyId
        ? {
            ...f,
            persons: f.persons.map(p => p.id === person.id ? person : p),
            updatedAt: new Date().toISOString()
          }
        : f
    );
    
    const newFamiliesData = {
      ...familiesData,
      families: updatedFamilies,
      lastUpdated: new Date().toISOString()
    };
    
    await saveFamiliesData(newFamiliesData);
    setFamiliesData(newFamiliesData);
  };
  
  // Supprimer une personne d'une famille
  const deletePerson = async (familyId: string, personId: string) => {
    const updatedFamilies = familiesData.families.map(f => 
      f.id === familyId
        ? {
            ...f,
            // Supprimer la personne
            persons: f.persons.filter(p => p.id !== personId),
            // Supprimer les relations associées
            relationships: f.relationships.filter(r => 
              r.sourceId !== personId && r.targetId !== personId
            ),
            updatedAt: new Date().toISOString()
          }
        : f
    );
    
    const newFamiliesData = {
      ...familiesData,
      families: updatedFamilies,
      lastUpdated: new Date().toISOString()
    };
    
    await saveFamiliesData(newFamiliesData);
    setFamiliesData(newFamiliesData);
  };
  
  // Ajouter une relation à une famille
  const addRelationship = async (familyId: string, relationship: Relationship) => {
    const updatedFamilies = familiesData.families.map(f => 
      f.id === familyId
        ? {
            ...f,
            relationships: [...f.relationships, relationship],
            updatedAt: new Date().toISOString()
          }
        : f
    );
    
    const newFamiliesData = {
      ...familiesData,
      families: updatedFamilies,
      lastUpdated: new Date().toISOString()
    };
    
    await saveFamiliesData(newFamiliesData);
    setFamiliesData(newFamiliesData);
  };
  
  // Mettre à jour une relation dans une famille
  const updateRelationship = async (familyId: string, relationship: Relationship) => {
    const updatedFamilies = familiesData.families.map(f => 
      f.id === familyId
        ? {
            ...f,
            relationships: f.relationships.map(r => 
              r.id === relationship.id ? relationship : r
            ),
            updatedAt: new Date().toISOString()
          }
        : f
    );
    
    const newFamiliesData = {
      ...familiesData,
      families: updatedFamilies,
      lastUpdated: new Date().toISOString()
    };
    
    await saveFamiliesData(newFamiliesData);
    setFamiliesData(newFamiliesData);
  };
  
  // Supprimer une relation d'une famille
  const deleteRelationship = async (familyId: string, relationshipId: string) => {
    const updatedFamilies = familiesData.families.map(f => 
      f.id === familyId
        ? {
            ...f,
            relationships: f.relationships.filter(r => r.id !== relationshipId),
            updatedAt: new Date().toISOString()
          }
        : f
    );
    
    const newFamiliesData = {
      ...familiesData,
      families: updatedFamilies,
      lastUpdated: new Date().toISOString()
    };
    
    await saveFamiliesData(newFamiliesData);
    setFamiliesData(newFamiliesData);
  };
  
  // Obtenir toutes les données
  const getAllData = () => familiesData;
  
  return (
    <FamilyContext.Provider
      value={{
        families: familiesData.families,
        activeFamily,
        loading,
        setActiveFamily,
        addFamily,
        updateFamily,
        deleteFamily,
        addPerson,
        updatePerson,
        deletePerson,
        addRelationship,
        updateRelationship,
        deleteRelationship,
        getAllData
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}