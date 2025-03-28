// src/lib/algorithms/pathFinding.ts
import { Person } from '../models/Person';
import { Relationship } from '../models/Relationship';
import { breadthFirstSearch, BFSResult } from './bfsSearch';

export interface RelationshipPath {
  path: Relationship[];
  description: string;
  degree: number;
}

export function findRelationshipPath(
  persons: Map<string, Person>,
  relationships: Relationship[],
  person1Id: string,
  person2Id: string
): RelationshipPath | null {
  // Utiliser BFS bidirectionnel pour optimiser la recherche
  const forwardResults = breadthFirstSearch(persons, relationships, person1Id);
  
  // Si on a trouvé directement le chemin vers person2
  if (forwardResults.has(person2Id)) {
    const result = forwardResults.get(person2Id)!;
    return {
      path: result.path,
      description: describeRelationship(persons, result.path, person1Id, person2Id),
      degree: calculateRelationshipDegree(result.path)
    };
  }
  
  // Si on n'a pas trouvé de chemin direct, on pourrait implémenter
  // un algorithme plus complexe ici pour les relations indirectes
  
  return null;
}

export function describeRelationship(
  persons: Map<string, Person>,
  path: Relationship[],
  startId: string,
  endId: string
): string {
  if (path.length === 0) return "Même personne";
  
  // Déterminer le type de relation en fonction du chemin
  if (path.length === 1) {
    const rel = path[0];
    if (rel.type === "conjoint") {
      return rel.sousType === "marie" ? "Conjoint(e)" : "Partenaire";
    }
    if (rel.type === "parent" && rel.sourceId === startId) {
      return rel.sousType === "pere" ? "Père" : rel.sousType === "mere" ? "Mère" : "Parent";
    }
    if (rel.type === "parent" && rel.targetId === startId) {
      return rel.sousType === "pere" ? "Fils" : rel.sousType === "mere" ? "Fille" : "Enfant";
    }
    // Autres cas simples
  }
  
  // Frère/Soeur (même parents)
  if (path.length === 2 && 
      path[0].type === "parent" && path[1].type === "parent" &&
      path[0].sourceId === path[1].sourceId) {
    const siblingPerson = persons.get(endId);
    if (siblingPerson) {
      return siblingPerson.sexe === "M" ? "Frère" : "Sœur";
    }
    return "Frère/Sœur";
  }
  
  // Grand-parent / Petit-enfant
  if (path.length === 2 && 
      path[0].type === "parent" && path[1].type === "parent") {
    if (path[0].targetId === startId) {
      return "Grand-parent";
    } else {
      return "Petit-enfant";
    }
  }
  
  // Oncle/Tante - Neveu/Nièce
  if (path.length === 3 && 
      path[0].type === "parent" && path[1].type === "parent" && path[2].type === "parent") {
    // Logique pour déterminer oncle/tante ou neveu/nièce
  }
  
  // Cousin
  if (path.length === 4 && 
      path[0].type === "parent" && path[1].type === "parent" && 
      path[2].type === "parent" && path[3].type === "parent") {
    return "Cousin(e)";
  }
  
  // Si la relation est trop complexe ou inconnue
  return `Relation de degré ${calculateRelationshipDegree(path)}`;
}

export function calculateRelationshipDegree(path: Relationship[]): number {
  // Formule canonique pour le calcul du degré de parenté
  // Dans le système civil : somme des distances aux ancêtres communs
  return path.length;
}