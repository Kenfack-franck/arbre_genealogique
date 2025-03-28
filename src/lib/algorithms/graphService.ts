// src/lib/services/graphService.ts
import { Person } from '../models/Person';
import { Relationship } from '../models/Relationship';
import { FamilyTreeData } from '../models/FamilyTree';
import { breadthFirstSearch } from '../algorithms/bfsSearch';
import { findRelationshipPath } from '../algorithms/pathFinding';
import { validateFamilyTree } from '../algorithms/validation';
import { generateTreeLayout } from '../algorithms/treeLayout';

export class GraphService {
  private persons: Map<string, Person> = new Map();
  private relationships: Relationship[] = [];
  private relationshipsBySourceId: Map<string, Relationship[]> = new Map();
  private relationshipsByTargetId: Map<string, Relationship[]> = new Map();
  
  constructor() {}
  
  // Chargement des données
  loadData(data: FamilyTreeData): void {
    this.clear();
    
    // Charger les personnes
    data.persons.forEach(person => {
      this.persons.set(person.id, { ...person });
    });
    
    // Charger les relations
    data.relationships.forEach(relation => {
      this.addRelationshipToIndex(relation);
    });
  }
  
  // Réinitialiser
  clear(): void {
    this.persons.clear();
    this.relationships = [];
    this.relationshipsBySourceId.clear();
    this.relationshipsByTargetId.clear();
  }
  
  // Méthodes d'accès aux données
  getAllPersons(): Person[] {
    return Array.from(this.persons.values());
  }
  
  getAllPersonIds(): string[] {
    return Array.from(this.persons.keys());
  }
  
  getPersonById(id: string): Person | undefined {
    return this.persons.get(id);
  }
  
  getAllRelationships(): Relationship[] {
    return this.relationships;
  }
  
  getRelationshipsBySourceId(id: string): Relationship[] {
    return this.relationshipsBySourceId.get(id) || [];
  }
  
  getRelationshipsByTargetId(id: string): Relationship[] {
    return this.relationshipsByTargetId.get(id) || [];
  }
  
  // Méthodes de manipulation
  addPerson(person: Person): void {
    this.persons.set(person.id, { ...person });
  }
  
  updatePerson(person: Person): void {
    if (this.persons.has(person.id)) {
      this.persons.set(person.id, { ...person });
    }
  }
  
  deletePerson(id: string): void {
    // Supprimer la personne
    this.persons.delete(id);
    
    // Supprimer les relations associées
    const relationsToRemove = [
      ...this.getRelationshipsBySourceId(id),
      ...this.getRelationshipsByTargetId(id)
    ];
    
    for (const relation of relationsToRemove) {
      this.deleteRelationship(relation.id);
    }
  }
  
  addRelationship(relationship: Relationship): void {
    this.addRelationshipToIndex(relationship);
  }
  
  updateRelationship(relationship: Relationship): void {
    // Trouver et supprimer l'ancienne relation
    const index = this.relationships.findIndex(r => r.id === relationship.id);
    if (index !== -1) {
      const oldRelationship = this.relationships[index];
      
      // Supprimer des index
      this.removeRelationshipFromIndex(oldRelationship);
      
      // Mettre à jour
      this.relationships[index] = { ...relationship };
      
      // Ajouter aux index
      this.addRelationshipToIndex(relationship);
    }
  }
  
  deleteRelationship(id: string): void {
    const index = this.relationships.findIndex(r => r.id === id);
    if (index !== -1) {
      const relationship = this.relationships[index];
      
      // Supprimer des index
      this.removeRelationshipFromIndex(relationship);
      
      // Supprimer de la liste
      this.relationships.splice(index, 1);
    }
  }
  
  // Algorithmes
  findRelatives(personId: string, relationType?: string, maxDepth: number = 2) {
    return breadthFirstSearch(
      this.persons,
      this.relationships,
      personId,
      { 
        maxDepth,
        relationTypes: relationType ? [relationType] : undefined 
      }
    );
  }
  
  findRelationshipPath(person1Id: string, person2Id: string) {
    return findRelationshipPath(
      this.persons,
      this.relationships,
      person1Id,
      person2Id
    );
  }
  
  validateFamilyTree() {
    return validateFamilyTree(
      this.getAllPersons(),
      this.relationships
    );
  }
  
  generateTreeLayout(rootPersonId: string, options?: any) {
    return generateTreeLayout(
      this.getAllPersons(),
      this.relationships,
      rootPersonId,
      options
    );
  }
  
  // Méthodes auxiliaires privées
  private addRelationshipToIndex(relationship: Relationship): void {
    // Ajouter à la liste principale
    this.relationships.push({ ...relationship });
    
    // Indexer par source
    if (!this.relationshipsBySourceId.has(relationship.sourceId)) {
      this.relationshipsBySourceId.set(relationship.sourceId, []);
    }
    this.relationshipsBySourceId.get(relationship.sourceId)!.push(relationship);
    
    // Indexer par cible
    if (!this.relationshipsByTargetId.has(relationship.targetId)) {
      this.relationshipsByTargetId.set(relationship.targetId, []);
    }
    this.relationshipsByTargetId.get(relationship.targetId)!.push(relationship);
  }
  
  private removeRelationshipFromIndex(relationship: Relationship): void {
    // Supprimer de l'index source
    const sourceRelations = this.relationshipsBySourceId.get(relationship.sourceId);
    if (sourceRelations) {
      const sourceIndex = sourceRelations.findIndex(r => r.id === relationship.id);
      if (sourceIndex !== -1) {
        sourceRelations.splice(sourceIndex, 1);
      }
    }
    
    // Supprimer de l'index cible
    const targetRelations = this.relationshipsByTargetId.get(relationship.targetId);
    if (targetRelations) {
      const targetIndex = targetRelations.findIndex(r => r.id === relationship.id);
      if (targetIndex !== -1) {
        targetRelations.splice(targetIndex, 1);
      }
    }
  }
  
  // Conversion format
  toFamilyTreeData(): FamilyTreeData {
    return {
      persons: this.getAllPersons(),
      relationships: [...this.relationships],
      metadata: {
        nom: "Arbre généalogique",
        dateCreation: new Date().toISOString(),
        dateMiseAJour: new Date().toISOString()
      }
    };
  }
}

// Exporter une instance singleton
export const graphService = new GraphService();