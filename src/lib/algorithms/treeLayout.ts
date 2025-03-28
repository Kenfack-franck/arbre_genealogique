// src/lib/algorithms/treeLayout.ts
import { Person } from '../models/Person';
import { Relationship } from '../models/Relationship';

export interface TreeNode {
  id: string;
  person: Person;
  x: number;
  y: number;
  level: number;
  spouseNodes: TreeNode[];
  childrenNodes: TreeNode[];
  parentNodes: TreeNode[];
}

export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  type: 'parent-child' | 'spouse';
  relationship: Relationship;
}

export interface TreeLayout {
  nodes: TreeNode[];
  edges: TreeEdge[];
  width: number;
  height: number;
}

export function generateTreeLayout(
  persons: Person[],
  relationships: Relationship[],
  rootPersonId: string,
  options = { 
    horizontal: true, 
    levelDistance: 100, 
    nodeDistance: 60 
  }
): TreeLayout {
  // Convertir les personnes en Map pour accès rapide
  const personsMap = new Map(persons.map(p => [p.id, p]));
  
  // Créer des index pour les relations
  const relationsByType = new Map<string, Relationship[]>();
  relationships.forEach(rel => {
    if (!relationsByType.has(rel.type)) {
      relationsByType.set(rel.type, []);
    }
    relationsByType.get(rel.type)!.push(rel);
  });
  
  // Fonction pour trouver les relations d'une personne par type
  function getRelationsForPerson(personId: string, type: string, asSource: boolean = true): Relationship[] {
    const relations = relationsByType.get(type) || [];
    return relations.filter(rel => 
      asSource ? rel.sourceId === personId : rel.targetId === personId
    );
  }
  
  // Construire l'arbre à partir de la personne racine
  const builtNodes = new Map<string, TreeNode>();
  const edges: TreeEdge[] = [];
  
  function buildTree(personId: string, level: number, x: number): TreeNode {
    // Éviter les cycles
    if (builtNodes.has(personId)) {
      return builtNodes.get(personId)!;
    }
    
    const person = personsMap.get(personId);
    if (!person) {
      throw new Error(`Person with ID ${personId} not found`);
    }
    
    // Créer le nœud
    const node: TreeNode = {
      id: personId,
      person,
      x,
      y: level * options.levelDistance,
      level,
      spouseNodes: [],
      childrenNodes: [],
      parentNodes: []
    };
    
    builtNodes.set(personId, node);
    
    // Ajouter les conjoints
    const spouseRelations = getRelationsForPerson(personId, 'conjoint');
    let spouseX = x + options.nodeDistance;
    
    for (const spouseRel of spouseRelations) {
      const spouseId = spouseRel.targetId === personId ? spouseRel.sourceId : spouseRel.targetId;
      if (!builtNodes.has(spouseId)) {
        const spouseNode = buildTree(spouseId, level, spouseX);
        node.spouseNodes.push(spouseNode);
        
        // Ajouter la relation conjoint
        edges.push({
          id: `edge-spouse-${spouseRel.id}`,
          source: personId,
          target: spouseId,
          type: 'spouse',
          relationship: spouseRel
        });
        
        spouseX += options.nodeDistance;
      }
    }
    
    // Ajouter les enfants
    const childRelations = getRelationsForPerson(personId, 'parent', true);
    
    if (childRelations.length > 0) {
      // Calculer la position x des enfants
      const childLevel = level + 1;
      const childrenWidth = childRelations.length * options.nodeDistance;
      const childrenStartX = x - (childrenWidth / 2);
      
      for (let i = 0; i < childRelations.length; i++) {
        const childRel = childRelations[i];
        const childId = childRel.targetId;
        
        if (!builtNodes.has(childId)) {
          const childX = childrenStartX + (i * options.nodeDistance);
          const childNode = buildTree(childId, childLevel, childX);
          node.childrenNodes.push(childNode);
          
          // Ajouter la relation parent-enfant
          edges.push({
            id: `edge-parent-${childRel.id}`,
            source: personId,
            target: childId,
            type: 'parent-child',
            relationship: childRel
          });
        }
      }
    }
    
    // Ajouter les parents
    const parentRelations = getRelationsForPerson(personId, 'parent', false);
    
    if (parentRelations.length > 0) {
      const parentLevel = level - 1;
      
      for (const parentRel of parentRelations) {
        const parentId = parentRel.sourceId;
        
        if (!builtNodes.has(parentId)) {
          const parentNode = buildTree(parentId, parentLevel, x - options.nodeDistance);
          node.parentNodes.push(parentNode);
          
          // La relation est déjà ajoutée dans la boucle des enfants
        }
      }
    }
    
    return node;
  }
  
  // Commencer la construction depuis la racine
  ///////////////////////const rootNode = buildTree(rootPersonId, 0, 0);
  
  // Ajuster les positions pour éviter les chevauchements (algorithme simplifié)
  // Un algorithme plus complexe serait nécessaire pour une disposition optimale
  
  // Calculer les dimensions totales
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  
  for (const node of builtNodes.values()) {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
  }
  
  return {
    nodes: Array.from(builtNodes.values()),
    edges,
    width: maxX - minX + options.nodeDistance,
    height: maxY - minY + options.levelDistance
  };
}