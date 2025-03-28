// src/context/FamilyContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FamilyTreeData } from '../lib/models/FamilyTree';
import { initializeIfEmpty, saveFamilyTree, loadFamilyTree } from '../lib/services/storageService';

interface FamilyContextType {
  familyTree: FamilyTreeData | null;
  loading: boolean;
  setFamilyTree: (data: FamilyTreeData) => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [familyTree, setFamilyTreeState] = useState<FamilyTreeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await initializeIfEmpty();
        setFamilyTreeState(data);
      } catch (error) {
        console.error('Failed to load family tree data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const setFamilyTree = async (data: FamilyTreeData) => {
    await saveFamilyTree(data);
    setFamilyTreeState(data);
  };

  return (
    <FamilyContext.Provider
      value={{
        familyTree,
        loading,
        setFamilyTree,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}