// src/lib/algorithms/bfsSearchBasic.ts
import { Graph } from '../models/Graph';

export interface BFSOptions {
  startNodeId: string;
  visitCallback?: (nodeId: string, depth: number) => void;
  maxDepth?: number;
}

export interface BFSResult {
  visitedOrder: string[];
  visitedNodes: Set<string>;
  paths: Map<string, string[]>;
  depthMap: Map<string, number>;
}

/**
 * Exécute un parcours en largeur (BFS) sur un graphe
 * @param graph Le graphe à parcourir
 * @param options Options de configuration du BFS
 * @returns Résultat du parcours
 */
export function breadthFirstSearchBasic(graph: Graph, options: BFSOptions): BFSResult {
  const { startNodeId, visitCallback, maxDepth = Infinity } = options;
  
  const visitedOrder: string[] = []; // Ordre de visite des nœuds
  const visitedNodes = new Set<string>(); // Ensemble des nœuds visités
  const queue: { nodeId: string; depth: number; path: string[] }[] = []; // File d'attente
  const paths = new Map<string, string[]>(); // Chemins pour atteindre chaque nœud
  const depthMap = new Map<string, number>(); // Profondeur de chaque nœud
  
  // Initialiser pour le nœud de départ
  visitedNodes.add(startNodeId);
  visitedOrder.push(startNodeId);
  queue.push({ nodeId: startNodeId, depth: 0, path: [startNodeId] });
  paths.set(startNodeId, [startNodeId]);
  depthMap.set(startNodeId, 0);
  
  // Exécuter le callback pour le nœud de départ
  if (visitCallback) {
    visitCallback(startNodeId, 0);
  }
  
  // Parcours BFS
  while (queue.length > 0) {
    const { nodeId, depth, path } = queue.shift()!;
    
    // Ne pas explorer au-delà de la profondeur maximale
    if (depth >= maxDepth) continue;
    
    // Récupérer les voisins du nœud
    const neighbors = graph.getNeighbors(nodeId);
    
    // Explorer les voisins non visités
    for (const neighborId of neighbors) {
      if (!visitedNodes.has(neighborId)) {
        // Marquer comme visité
        visitedNodes.add(neighborId);
        visitedOrder.push(neighborId);
        
        // Mettre à jour le chemin
        const newPath = [...path, neighborId];
        paths.set(neighborId, newPath);
        depthMap.set(neighborId, depth + 1);
        
        // Ajouter à la file d'attente
        queue.push({ nodeId: neighborId, depth: depth + 1, path: newPath });
        
        // Exécuter le callback
        if (visitCallback) {
          visitCallback(neighborId, depth + 1);
        }
      }
    }
  }
  
  return {
    visitedOrder,
    visitedNodes,
    paths,
    depthMap
  };
}

/**
 * Crée une représentation visuelle du parcours BFS sous forme de niveaux
 * Utile pour comprendre la structure en "couches" d'un BFS
 */
export function createBFSLevelVisualization(result: BFSResult): { [level: number]: string[] } {
  const levels: { [level: number]: string[] } = {};
  
  // Regrouper les nœuds par niveau
  Array.from(result.depthMap.entries()).forEach(([nodeId, depth]) => {
    if (!levels[depth]) {
      levels[depth] = [];
    }
    levels[depth].push(nodeId);
  });
  
  return levels;
}