// src/lib/algorithms/dfsSearch.ts
import { Graph } from '../models/Graph';

export interface DFSOptions {
  startNodeId: string;
  visitCallback?: (nodeId: string, depth: number) => void;
  maxDepth?: number;
}

export interface DFSResult {
  visitedOrder: string[];
  visitedNodes: Set<string>;
  paths: Map<string, string[]>;
  depthMap: Map<string, number>;
}

/**
 * Exécute un parcours en profondeur (DFS) sur un graphe
 * @param graph Le graphe à parcourir
 * @param options Options de configuration du DFS
 * @returns Résultat du parcours
 */
export function depthFirstSearch(graph: Graph, options: DFSOptions): DFSResult {
  const { startNodeId, visitCallback, maxDepth = Infinity } = options;
  
  const visitedOrder: string[] = []; // Ordre de visite des nœuds
  const visitedNodes = new Set<string>(); // Ensemble des nœuds visités
  const paths = new Map<string, string[]>(); // Chemins pour atteindre chaque nœud
  const depthMap = new Map<string, number>(); // Profondeur de chaque nœud

  // Initialiser le chemin pour le nœud de départ
  paths.set(startNodeId, [startNodeId]);
  depthMap.set(startNodeId, 0);

  // Version itérative du DFS (avec pile explicite)
  function dfsIterative() {
    const stack: { nodeId: string; depth: number }[] = [{ nodeId: startNodeId, depth: 0 }];
    
    while (stack.length > 0) {
      const { nodeId, depth } = stack.pop()!;
      
      // Si le nœud a déjà été visité ou si on dépasse la profondeur maximale, passer au suivant
      if (visitedNodes.has(nodeId) || depth > maxDepth) continue;
      
      // Marquer le nœud comme visité
      visitedNodes.add(nodeId);
      visitedOrder.push(nodeId);
      
      // Exécuter le callback s'il existe
      if (visitCallback) {
        visitCallback(nodeId, depth);
      }
      
      // Récupérer les voisins du nœud et les ajouter à la pile dans l'ordre inverse
      // pour maintenir l'ordre de visite naturel
      const neighbors = [...graph.getNeighbors(nodeId)].reverse();
      
      for (const neighborId of neighbors) {
        if (!visitedNodes.has(neighborId)) {
          stack.push({ nodeId: neighborId, depth: depth + 1 });
          
          // Mettre à jour le chemin pour atteindre ce voisin si pas déjà défini
          if (!paths.has(neighborId)) {
            const currentPath = paths.get(nodeId) || [];
            paths.set(neighborId, [...currentPath, neighborId]);
            depthMap.set(neighborId, depth + 1);
          }
        }
      }
    }
  }
  
  // Fonction récursive pour le DFS (alternative)
  function dfsRecursive(nodeId: string, depth: number) {
    // Vérifier la profondeur maximale
    if (depth > maxDepth) return;
    
    // Marquer le nœud comme visité
    visitedNodes.add(nodeId);
    visitedOrder.push(nodeId);
    
    // Exécuter le callback s'il existe
    if (visitCallback) {
      visitCallback(nodeId, depth);
    }
    
    // Récupérer les voisins du nœud
    const neighbors = graph.getNeighbors(nodeId);
    
    // Explorer les voisins non visités
    for (const neighborId of neighbors) {
      if (!visitedNodes.has(neighborId)) {
        // Mettre à jour le chemin pour atteindre ce voisin
        const currentPath = paths.get(nodeId) || [];
        paths.set(neighborId, [...currentPath, neighborId]);
        depthMap.set(neighborId, depth + 1);
        
        // Explorer récursivement
        dfsRecursive(neighborId, depth + 1);
      }
    }
  }
  
  // Démarrer le parcours (version itérative par défaut)
  dfsIterative();
  // Alternativement, on pourrait utiliser la version récursive:
  // dfsRecursive(startNodeId, 0);
  
  return {
    visitedOrder,
    visitedNodes,
    paths,
    depthMap
  };
}