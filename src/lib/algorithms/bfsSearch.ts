// src/lib/algorithms/bfsSearch.ts
import { Person } from '../models/Person';
import { Relationship } from '../models/Relationship';

export interface BFSOptions {
  maxDepth?: number;
  relationTypes?: string[];
  directionFilter?: 'outgoing' | 'incoming' | 'both';
}

export interface BFSResult {
  person: Person;
  distance: number;
  path: Relationship[];
}

export function breadthFirstSearch(
  persons: Map<string, Person>,
  relationships: Relationship[],
  startId: string,
  options: BFSOptions = {}
): Map<string, BFSResult> {
  const { 
    maxDepth = Infinity, 
    relationTypes = [], 
    directionFilter = 'both' 
  } = options;
  
  // Création des index pour les relations
  const relationsBySourceId = new Map<string, Relationship[]>();
  const relationsByTargetId = new Map<string, Relationship[]>();
  
  for (const rel of relationships) {
    // Indexer par source
    if (!relationsBySourceId.has(rel.sourceId)) {
      relationsBySourceId.set(rel.sourceId, []);
    }
    relationsBySourceId.get(rel.sourceId)!.push(rel);
    
    // Indexer par cible
    if (!relationsByTargetId.has(rel.targetId)) {
      relationsByTargetId.set(rel.targetId, []);
    }
    relationsByTargetId.get(rel.targetId)!.push(rel);
  }
  
  // File d'attente BFS
  const queue: {id: string; distance: number; path: Relationship[]}[] = [
    {id: startId, distance: 0, path: []}
  ];
  const visited = new Set<string>([startId]);
  const result = new Map<string, BFSResult>();
  
  while (queue.length > 0) {
    const { id, distance, path } = queue.shift()!;
    const person = persons.get(id);
    
    if (!person) continue;
    
    result.set(id, { person, distance, path });
    
    if (distance >= maxDepth) continue;
    
    // Explorer toutes les relations selon le filtre de direction
    let relationsToExplore: Relationship[] = [];
    
    if (directionFilter === 'outgoing' || directionFilter === 'both') {
      const outgoing = relationsBySourceId.get(id) || [];
      relationsToExplore = relationsToExplore.concat(outgoing);
    }
    
    if (directionFilter === 'incoming' || directionFilter === 'both') {
      const incoming = relationsByTargetId.get(id) || [];
      relationsToExplore = relationsToExplore.concat(incoming);
    }
    
    // Filtrer par type de relation si spécifié
    if (relationTypes.length > 0) {
      relationsToExplore = relationsToExplore.filter(rel => 
        relationTypes.includes(rel.type)
      );
    }
    
    // Parcourir les relations
    for (const relation of relationsToExplore) {
      const nextId = relation.sourceId === id ? relation.targetId : relation.sourceId;
      
      if (!visited.has(nextId)) {
        visited.add(nextId);
        const newPath = [...path, relation];
        queue.push({
          id: nextId,
          distance: distance + 1,
          path: newPath
        });
      }
    }
  }
  
  return result;
}