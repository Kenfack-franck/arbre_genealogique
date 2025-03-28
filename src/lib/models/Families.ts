// src/lib/models/Families.ts
import { Person } from './Person';
import { Relationship } from './Relationship';

export interface Family {
  id: string;
  name: string;
  description: string;
  persons: Person[];
  relationships: Relationship[];
  createdAt: string;
  updatedAt: string;
  rootPersonId?: string; // Optionnel: personne racine de l'arbre
}

export interface FamiliesData {
  families: Family[];
  activeFamilyId: string | null;
  lastUpdated: string;
}