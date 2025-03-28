// src/lib/models/FamilyTree.ts
import { Person } from './Person';
import { Relationship } from './Relationship';

export interface FamilyTreeMetadata {
  nom: string;
  dateCreation: string;
  dateMiseAJour: string;
}

export interface FamilyTreeData {
  persons: Person[];
  relationships: Relationship[];
  metadata: FamilyTreeMetadata;
}