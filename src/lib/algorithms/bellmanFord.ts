// src/lib/algorithms/bellmanFord.ts
import { GraphWeighted, Edge } from '../models/GraphWeighted';

export interface BellmanFordResult {
  distances: Map<string, number>;
  predecessors: Map<string, string | null>;
  hasNegativeCycle: boolean;
  steps: BellmanFordStep[];
  iterationDistances: Map<string, number>[]; // Distances à chaque itération
}

export interface BellmanFordStep {
  iteration: number;
  edge: Edge;
  relaxed: boolean;
  newDistance?: number;
  distanceTable: Map<string, number>;
}

/**
 * Implémente l'algorithme de Bellman-Ford pour trouver les plus courts chemins
 * depuis un nœud source vers tous les autres nœuds du graphe, avec support des poids négatifs.
 * 
 * @param graph Graphe pondéré
 * @param startNodeId ID du nœud source
 * @returns Résultat de l'algorithme (distances, prédécesseurs, présence de cycle négatif)
 */
export function bellmanFord(graph: GraphWeighted, startNodeId: string): BellmanFordResult {
  const distances = new Map<string, number>();
  const predecessors = new Map<string, string | null>();
  const steps: BellmanFordStep[] = [];
  const iterationDistances: Map<string, number>[] = [];
  
  // Initialiser les distances à l'infini et les prédécesseurs à null
  graph.getNodes().forEach(node => {
    distances.set(node.id, node.id === startNodeId ? 0 : Infinity);
    predecessors.set(node.id, null);
  });
  
  const edges = graph.getEdges();
  const nodeCount = graph.getNodes().length;
  
  // Enregistrer les distances initiales
  iterationDistances.push(new Map(distances));
  
  // Phase 1: Relaxer toutes les arêtes |V| - 1 fois
  for (let i = 0; i < nodeCount - 1; i++) {
    let hasRelaxation = false;
    
    // Pour chaque arête
    for (const edge of edges) {
      const sourceDistance = distances.get(edge.source)!;
      
      // Si le nœud source est accessible
      if (sourceDistance !== Infinity) {
        const targetDistance = distances.get(edge.target)!;
        const newDistance = sourceDistance + edge.weight;
        
        // Si on trouve un chemin plus court
        if (newDistance < targetDistance) {
          distances.set(edge.target, newDistance);
          predecessors.set(edge.target, edge.source);
          hasRelaxation = true;
          
          // Enregistrer cette étape
          steps.push({
            iteration: i + 1,
            edge,
            relaxed: true,
            newDistance,
            distanceTable: new Map(distances)
          });
        } else {
          // Aucune relaxation pour cette arête
          steps.push({
            iteration: i + 1,
            edge,
            relaxed: false,
            distanceTable: new Map(distances)
          });
        }
      }
    }
    
    // Enregistrer les distances après cette itération
    iterationDistances.push(new Map(distances));
    
    // Optimisation: si aucune relaxation dans cette itération, on peut s'arrêter
    if (!hasRelaxation) {
      break;
    }
  }
  
  // Phase 2: Vérifier s'il y a un cycle de poids négatif
  let hasNegativeCycle = false;
  
  for (const edge of edges) {
    const sourceDistance = distances.get(edge.source)!;
    
    if (sourceDistance !== Infinity) {
      const targetDistance = distances.get(edge.target)!;
      const newDistance = sourceDistance + edge.weight;
      
      // Si on peut encore relaxer après |V| - 1 itérations, il y a un cycle négatif
      if (newDistance < targetDistance) {
        hasNegativeCycle = true;
        break;
      }
    }
  }
  
  return {
    distances,
    predecessors,
    hasNegativeCycle,
    steps,
    iterationDistances
  };
}

/**
 * Reconstruit le chemin le plus court du nœud source au nœud cible
 * 
 * @param result Résultat de l'algorithme de Bellman-Ford
 * @param targetNodeId ID du nœud cible
 * @returns Chemin (liste ordonnée des IDs de nœuds) ou null si pas de chemin
 */
export function reconstructPath(result: BellmanFordResult, targetNodeId: string): string[] | null {
  // Si le graphe a un cycle négatif, les distances ne sont pas fiables
  if (result.hasNegativeCycle) {
    return null;
  }
  
  const { predecessors, distances } = result;
  
  // Vérifier si le nœud cible est accessible
  if (distances.get(targetNodeId) === Infinity) {
    return null;
  }
  
  const path: string[] = [];
  let currentNode: string | null = targetNodeId;
  const visited = new Set<string>(); // Pour éviter les boucles infinies
  
  // Remonter les prédécesseurs jusqu'à la source
  while (currentNode !== null) {
    // Vérifier si on est dans une boucle
    if (visited.has(currentNode)) {
      return null; // Boucle détectée
    }
    
    visited.add(currentNode);
    path.unshift(currentNode);
    currentNode = predecessors.get(currentNode)!;
  }
  
  return path;
}