// src/lib/algorithms/kruskal.ts
import { GraphWeighted, Edge } from '../models/GraphWeighted';

export interface KruskalResult {
  minimumSpanningTree: Edge[];
  totalWeight: number;
  steps: KruskalStep[];
}

export interface KruskalStep {
  edge: Edge;
  accepted: boolean;
  reason: string;
  currentForest: { [nodeId: string]: string }; // Représentation de la forêt
  mstEdges: Edge[]; // Arêtes de l'ACM à cette étape
}

/**
 * Implémente l'algorithme de Kruskal pour trouver l'arbre couvrant minimal d'un graphe
 * 
 * @param graph Graphe pondéré
 * @returns Résultat contenant l'arbre couvrant minimal, son poids total et les étapes
 */
export function kruskal(graph: GraphWeighted): KruskalResult {
  // Ne fonctionne que sur des graphes non dirigés
  if (graph.directed) {
    throw new Error("L'algorithme de Kruskal nécessite un graphe non dirigé");
  }
  
  const nodes = graph.getNodes();
  const edges = [...graph.getEdges()]; // Copie pour pouvoir trier
  const minimumSpanningTree: Edge[] = [];
  const steps: KruskalStep[] = [];
  
  // Trier les arêtes par poids croissant
  edges.sort((a, b) => a.weight - b.weight);
  
  // Initialiser la structure Union-Find (chaque nœud est dans son propre ensemble)
  const forest: { [nodeId: string]: string } = {};
  nodes.forEach(node => {
    forest[node.id] = node.id;
  });
  
  // Fonction pour trouver la racine d'un nœud dans la forêt
  const findRoot = (nodeId: string): string => {
    if (forest[nodeId] !== nodeId) {
      // Compression de chemin
      forest[nodeId] = findRoot(forest[nodeId]);
    }
    return forest[nodeId];
  };
  
  // Fonction pour unir deux ensembles
  const union = (nodeId1: string, nodeId2: string): void => {
    const root1 = findRoot(nodeId1);
    const root2 = findRoot(nodeId2);
    forest[root2] = root1;
  };
  
  // Parcourir toutes les arêtes triées
  for (const edge of edges) {
    const sourceRoot = findRoot(edge.source);
    const targetRoot = findRoot(edge.target);
    
    // Si les nœuds ne sont pas déjà dans le même ensemble (évite les cycles)
    if (sourceRoot !== targetRoot) {
      // Ajouter l'arête à l'ACM
      minimumSpanningTree.push(edge);
      
      // Unir les deux ensembles
      union(edge.source, edge.target);
      
      // Enregistrer cette étape comme acceptée
      steps.push({
        edge,
        accepted: true,
        reason: `Les nœuds ${edge.source} et ${edge.target} sont dans des composantes différentes`,
        currentForest: { ...forest },
        mstEdges: [...minimumSpanningTree]
      });
      
      // Arrêter si on a |V| - 1 arêtes (ACM complet)
      if (minimumSpanningTree.length === nodes.length - 1) {
        break;
      }
    } else {
      // Enregistrer cette étape comme rejetée (créerait un cycle)
      steps.push({
        edge,
        accepted: false,
        reason: `Les nœuds ${edge.source} et ${edge.target} sont déjà dans la même composante`,
        currentForest: { ...forest },
        mstEdges: [...minimumSpanningTree]
      });
    }
  }
  
  // Calculer le poids total de l'ACM
  const totalWeight = minimumSpanningTree.reduce((sum, edge) => sum + edge.weight, 0);
  
  return {
    minimumSpanningTree,
    totalWeight,
    steps
  };
}

/**
 * Vérifie si l'arbre couvrant minimal est complet (couvre tous les nœuds)
 * 
 * @param result Résultat de l'algorithme de Kruskal
 * @param graph Graphe original
 * @returns True si l'ACM est complet, false sinon
 */
export function isCompleteSpanningTree(result: KruskalResult, graph: GraphWeighted): boolean {
  const nodeCount = graph.getNodes().length;
  return result.minimumSpanningTree.length === nodeCount - 1;
}