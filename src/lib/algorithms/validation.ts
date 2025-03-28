// src/lib/algorithms/validation.ts
import { Person } from '../models/Person';
import { Relationship } from '../models/Relationship';

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  personId?: string;
  relationshipId?: string;
}

export function validateFamilyTree(
  persons: Person[],
  relationships: Relationship[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const personsMap = new Map(persons.map(p => [p.id, p]));
  
  // Validation des références
  for (const rel of relationships) {
    if (!personsMap.has(rel.sourceId)) {
      errors.push({
        type: 'error',
        message: `Relation fait référence à une personne source inexistante (ID: ${rel.sourceId})`,
        relationshipId: rel.id
      });
    }
    
    if (!personsMap.has(rel.targetId)) {
      errors.push({
        type: 'error',
        message: `Relation fait référence à une personne cible inexistante (ID: ${rel.targetId})`,
        relationshipId: rel.id
      });
    }
  }
  
  // Validation des dates
  for (const person of persons) {
    if (person.birthDate && person.deathDate) {
      const birthDate = new Date(person.birthDate);
      const deathDate = new Date(person.deathDate);
      
      if (birthDate > deathDate) {
        errors.push({
          type: 'error',
          message: `Date de naissance postérieure à la date de décès`,
          personId: person.id
        });
      }
    }
    
    if (person.deathDate && person.etat === 'vivant') {
      errors.push({
        type: 'warning',
        message: `Personne marquée comme vivante mais avec une date de décès`,
        personId: person.id
      });
    }
  }
  
  // Validation des relations parent-enfant
  const parentChildRelations = relationships.filter(rel => rel.type === 'parent');
  for (const rel of parentChildRelations) {
    const parent = personsMap.get(rel.sourceId);
    const child = personsMap.get(rel.targetId);
    
    if (parent && child && parent.birthDate && child.birthDate) {
      const parentBirth = new Date(parent.birthDate);
      const childBirth = new Date(child.birthDate);
      
      // Vérifier l'écart minimal entre parent et enfant (ex: 12 ans)
      const minParentAge = 12; // En années
      const minParentAgeMs = minParentAge * 365.25 * 24 * 60 * 60 * 1000;
      
      if (childBirth.getTime() - parentBirth.getTime() < minParentAgeMs) {
        errors.push({
          type: 'warning',
          message: `Le parent ${parent.prenom} ${parent.nom} semble avoir moins de ${minParentAge} ans à la naissance de ${child.prenom} ${child.nom}`,
          relationshipId: rel.id
        });
      }
    }
  }
  
  // Vérification de cycles impossibles (une personne ne peut pas être son propre ancêtre)
  validateNoCycles(relationships, errors);
  
  return errors;
}

function validateNoCycles(relationships: Relationship[], errors: ValidationError[]): void {
  // Construction du graphe orienté pour les relations parent-enfant
  const parentToChildEdges = new Map<string, string[]>();
  
  for (const rel of relationships) {
    if (rel.type === 'parent') {
      if (!parentToChildEdges.has(rel.sourceId)) {
        parentToChildEdges.set(rel.sourceId, []);
      }
      parentToChildEdges.get(rel.sourceId)!.push(rel.targetId);
    }
  }
  
  // Détection de cycle avec un algorithme DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function checkForCycle(nodeId: string): boolean {
    if (!visited.has(nodeId)) {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const neighbors = parentToChildEdges.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && checkForCycle(neighbor)) {
          return true;
        } else if (recursionStack.has(neighbor)) {
          errors.push({
            type: 'error',
            message: `Cycle détecté: une personne ne peut pas être son propre ancêtre (ID: ${nodeId})`,
            personId: nodeId
          });
          return true;
        }
      }
    }
    recursionStack.delete(nodeId);
    return false;
  }
  
  // Vérifier chaque nœud
  for (const nodeId of parentToChildEdges.keys()) {
    if (!visited.has(nodeId)) {
      checkForCycle(nodeId);
    }
  }
}