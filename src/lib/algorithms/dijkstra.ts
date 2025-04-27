// src/lib/algorithms/dijkstra.ts
import { GraphWeighted, Node } from '../models/GraphWeighted';

export interface DijkstraResult {
  distances: Map<string, number>;
  predecessors: Map<string, string | null>;
  visitedOrder: string[];
  steps: DijkstraStep[];
}

export interface DijkstraStep {
  currentNode: string;
  currentDistance: number;
  distanceTable: Map<string, number>;
  relaxedEdges: { source: string; target: string; newDistance: number }[];
}

/**
 * Implémente l'algorithme de Dijkstra pour trouver les plus courts chemins
 * depuis un nœud source vers tous les autres nœuds du graphe.
 * 
 * @param graph Graphe pondéré
 * @param startNodeId ID du nœud source
 * @returns Résultat de l'algorithme (distances, prédécesseurs, ordre de visite)
 */
export function dijkstra(graph: GraphWeighted, startNodeId: string): DijkstraResult {
  // Vérifier que le graphe ne contient pas de poids négatifs
  if (!graph.isDijkstraCompatible()) {
    throw new Error("L'algorithme de Dijkstra ne fonctionne pas avec des poids négatifs");
  }
  
  const distances = new Map<string, number>();
  const predecessors = new Map<string, string | null>();
  const visited = new Set<string>();
  const visitedOrder: string[] = [];
  const steps: DijkstraStep[] = [];
  
  // Initialiser les distances à l'infini et les prédécesseurs à null
  graph.getNodes().forEach(node => {
    distances.set(node.id, node.id === startNodeId ? 0 : Infinity);
    predecessors.set(node.id, null);
  });
  
  // Tant qu'il reste des nœuds non visités
  while (visited.size < graph.getNodes().length) {
    // Trouver le nœud non visité avec la distance minimale
    let currentNode: string | null = null;
    let minDistance = Infinity;
    
    distances.forEach((distance, nodeId) => {
      if (!visited.has(nodeId) && distance < minDistance) {
        currentNode = nodeId;
        minDistance = distance;
      }
    });
    
    // Si tous les nœuds restants sont inaccessibles, on arrête
    if (currentNode === null || minDistance === Infinity) {
      break;
    }
    
    // Marquer le nœud comme visité
    visited.add(currentNode);
    visitedOrder.push(currentNode);
    
    // Récupérer les voisins du nœud courant avec leurs poids
    const neighbors = graph.getNeighborsWithWeights(currentNode);
    const relaxedEdges: { source: string; target: string; newDistance: number }[] = [];
    
    // Pour chaque voisin, mettre à jour la distance si on trouve un chemin plus court
    neighbors.forEach((weight, neighborId) => {
      if (!visited.has(neighborId)) {
        const newDistance = distances.get(currentNode!)! + weight;
        
        if (newDistance < distances.get(neighborId)!) {
          distances.set(neighborId, newDistance);
          predecessors.set(neighborId, currentNode);
          relaxedEdges.push({
            source: currentNode!,
            target: neighborId,
            newDistance
          });
        }
      }
    });
    
    // Enregistrer cette étape
    steps.push({
      currentNode,
      currentDistance: distances.get(currentNode)!,
      distanceTable: new Map(distances),
      relaxedEdges
    });
  }
  
  return {
    distances,
    predecessors,
    visitedOrder,
    steps
  };
}

/**
 * Reconstruit le chemin le plus court du nœud source au nœud cible
 * 
 * @param result Résultat de l'algorithme de Dijkstra
 * @param targetNodeId ID du nœud cible
 * @returns Chemin (liste ordonnée des IDs de nœuds) ou null si pas de chemin
 */
export function reconstructPath(result: DijkstraResult, targetNodeId: string): string[] | null {
  const { predecessors, distances } = result;
  
  // Vérifier si le nœud cible est accessible
  if (distances.get(targetNodeId) === Infinity) {
    return null;
  }
  
  const path: string[] = [];
  let currentNode: string | null = targetNodeId;
  
  // Remonter les prédécesseurs jusqu'à la source
  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = predecessors.get(currentNode)!;
  }
  
  return path;
}