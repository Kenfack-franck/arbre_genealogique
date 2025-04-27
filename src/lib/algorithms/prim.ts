// src/lib/algorithms/prim.ts
import { GraphWeighted, Edge } from '../models/GraphWeighted';

export interface PrimResult {
  minimumSpanningTree: Edge[];
  totalWeight: number;
  steps: PrimStep[];
}

export interface PrimStep {
  currentNode: string;
  addedEdge: Edge | null;
  candidateEdges: Edge[];
  nodeStatus: Map<string, boolean>; // true = dans l'arbre, false = hors de l'arbre
  mstEdges: Edge[]; // Arêtes de l'ACM à cette étape
}

/**
 * Implémente l'algorithme de Prim pour trouver l'arbre couvrant minimal d'un graphe
 * 
 * @param graph Graphe pondéré
 * @param startNodeId ID du nœud de départ (optionnel)
 * @returns Résultat contenant l'arbre couvrant minimal, son poids total et les étapes
 */
export function prim(graph: GraphWeighted, startNodeId?: string): PrimResult {
  // Ne fonctionne que sur des graphes non dirigés
  if (graph.directed) {
    throw new Error("L'algorithme de Prim nécessite un graphe non dirigé");
  }
  
  const nodes = graph.getNodes();
  
  // Si aucun nœud de départ n'est spécifié, prendre le premier
  if (!startNodeId && nodes.length > 0) {
    startNodeId = nodes[0].id;
  }
  
  if (!startNodeId) {
    throw new Error("Graphe vide ou nœud de départ invalide");
  }
  
  const minimumSpanningTree: Edge[] = [];
  const steps: PrimStep[] = [];
  
  // Ensemble des nœuds déjà inclus dans l'ACM
  const inTree = new Set<string>([startNodeId]);
  
  // File de priorité pour les arêtes candidates (implémentation simple)
  let candidateEdges: Edge[] = [];
  
  // Fonction pour mettre à jour les arêtes candidates
  const updateCandidateEdges = (nodeId: string) => {
    // Parcourir tous les voisins du nœud
    const neighbors = graph.getNeighborsWithWeights(nodeId);
    
    neighbors.forEach((weight, neighborId) => {
      // Si le voisin n'est pas déjà dans l'arbre
      if (!inTree.has(neighborId)) {
        // Ajouter l'arête aux candidates
        candidateEdges.push({
          source: nodeId,
          target: neighborId,
          weight
        });
      }
    });
    
    // Trier les arêtes candidates par poids croissant
    candidateEdges.sort((a, b) => a.weight - b.weight);
  };
  
  // Commencer avec le nœud de départ
  let currentNode = startNodeId;
  updateCandidateEdges(currentNode);
  
  // Enregistrer l'étape initiale
  steps.push({
    currentNode,
    addedEdge: null,
    candidateEdges: [...candidateEdges],
    nodeStatus: new Map(nodes.map(node => [node.id, inTree.has(node.id)])),
    mstEdges: []
  });
  
  // Continuer jusqu'à ce que tous les nœuds soient dans l'arbre ou qu'il n'y ait plus d'arêtes candidates
  while (inTree.size < nodes.length && candidateEdges.length > 0) {
    // Prendre l'arête de poids minimal
    let minEdge: Edge | undefined;
    
    // Trouver l'arête valide de poids minimal (qui ne crée pas de cycle)
    while (candidateEdges.length > 0) {
      const edge = candidateEdges.shift()!;
      
      // Vérifier si l'arête connecte un nœud de l'arbre à un nœud hors de l'arbre
      if (inTree.has(edge.source) && !inTree.has(edge.target)) {
        minEdge = edge;
        break;
      } else if (inTree.has(edge.target) && !inTree.has(edge.source)) {
        // Inverser l'arête si nécessaire
        minEdge = {
          source: edge.target,
          target: edge.source,
          weight: edge.weight
        };
        break;
      }
      // Sinon, l'arête est invalide (crée un cycle ou est obsolète), on continue
    }
    
    // Si aucune arête valide n'a été trouvée, on arrête
    if (!minEdge) {
      break;
    }
    
    // Ajouter l'arête à l'ACM
    minimumSpanningTree.push(minEdge);
    
    // Ajouter le nouveau nœud à l'ensemble des nœuds de l'arbre
    inTree.add(minEdge.target);
    
    // Mettre à jour les arêtes candidates avec ce nouveau nœud
    updateCandidateEdges(minEdge.target);
    
    // Enregistrer cette étape
    steps.push({
      currentNode: minEdge.target,
      addedEdge: minEdge,
      candidateEdges: [...candidateEdges],
      nodeStatus: new Map(nodes.map(node => [node.id, inTree.has(node.id)])),
      mstEdges: [...minimumSpanningTree]
    });
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
 * @param result Résultat de l'algorithme de Prim
 * @param graph Graphe original
 * @returns True si l'ACM est complet, false sinon
 */
export function isCompleteSpanningTree(result: PrimResult, graph: GraphWeighted): boolean {
  const nodeCount = graph.getNodes().length;
  return result.minimumSpanningTree.length === nodeCount - 1;
}