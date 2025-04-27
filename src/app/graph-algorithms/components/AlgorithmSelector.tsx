// src/app/graph-algorithms/components/AlgorithmSelector.tsx
'use client';

import React from 'react';
import { GraphWeighted } from '@/lib/models/GraphWeighted';
import { 
  AlgorithmCategory, 
  TraversalAlgorithm, 
  ShortestPathAlgorithm, 
  MSTAlgorithm 
} from '../page';
import { depthFirstSearch } from '@/lib/algorithms/dfsSearch';
import { breadthFirstSearchBasic } from '@/lib/algorithms/bfsSearchBasic';
import { dijkstra, reconstructPath as dijkstraPath } from '@/lib/algorithms/dijkstra';
import { bellmanFord, reconstructPath as bellmanFordPath } from '@/lib/algorithms/bellmanFord';
import { kruskal, isCompleteSpanningTree as isKruskalComplete } from '@/lib/algorithms/kruskal';
import { prim, isCompleteSpanningTree as isPrimComplete } from '@/lib/algorithms/prim';

interface AlgorithmSelectorProps {
  graph: GraphWeighted | null;
  algorithmCategory: AlgorithmCategory;
  setAlgorithmCategory: (category: AlgorithmCategory) => void;
  traversalAlgorithm: TraversalAlgorithm;
  setTraversalAlgorithm: (algorithm: TraversalAlgorithm) => void;
  shortestPathAlgorithm: ShortestPathAlgorithm;
  setShortestPathAlgorithm: (algorithm: ShortestPathAlgorithm) => void;
  mstAlgorithm: MSTAlgorithm;
  setMSTAlgorithm: (algorithm: MSTAlgorithm) => void;
  startNodeId: string;
  setStartNodeId: (id: string) => void;
  endNodeId: string;
  setEndNodeId: (id: string) => void;
  runAlgorithm: (result: any) => void;
  error: string | null;
  setError: (error: string | null) => void;
  getCurrentAlgorithmName: () => string;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  graph,
  algorithmCategory,
  setAlgorithmCategory,
  traversalAlgorithm,
  setTraversalAlgorithm,
  shortestPathAlgorithm,
  setShortestPathAlgorithm,
  mstAlgorithm,
  setMSTAlgorithm,
  startNodeId,
  setStartNodeId,
  endNodeId,
  setEndNodeId,
  runAlgorithm,
  error,
  setError,
  getCurrentAlgorithmName
}) => {
  // Exécution de l'algorithme choisi
  const executeAlgorithm = () => {
    // Vérifier que le graphe existe
    if (!graph) {
      setError("Veuillez d'abord créer un graphe");
      return;
    }
    
    try {
      setError(null);
      let algorithmResult;
      
      // Exécuter l'algorithme en fonction de la catégorie et du type
      if (algorithmCategory === 'traversal') {
        if (traversalAlgorithm === 'dfs') {
          algorithmResult = depthFirstSearch(graph, { startNodeId });
        } else {
          algorithmResult = breadthFirstSearchBasic(graph, { startNodeId });
        }
      } 
      else if (algorithmCategory === 'shortestPath') {
        if (shortestPathAlgorithm === 'dijkstra') {
          // Vérifier que le graphe n'a pas de poids négatifs
          if (!graph.isDijkstraCompatible()) {
            throw new Error("L'algorithme de Dijkstra ne fonctionne pas avec des poids négatifs");
          }
          algorithmResult = dijkstra(graph, startNodeId);
          
          // Si un nœud cible est spécifié, calculer le chemin
          if (endNodeId) {
            algorithmResult.path = dijkstraPath(algorithmResult, endNodeId);
          }
        } else {
          algorithmResult = bellmanFord(graph, startNodeId);
          
          // Si un nœud cible est spécifié, calculer le chemin
          if (endNodeId) {
            algorithmResult.path = bellmanFordPath(algorithmResult, endNodeId);
          }
          
          // Vérifier les cycles négatifs
          if (algorithmResult.hasNegativeCycle) {
            setError("Attention: Un cycle de poids négatif a été détecté. Les distances peuvent ne pas être correctes.");
          }
        }
      } 
      else if (algorithmCategory === 'minimumSpanningTree') {
        if (mstAlgorithm === 'kruskal') {
          algorithmResult = kruskal(graph);
          
          // Vérifier si l'ACM est complet
          if (!isKruskalComplete(algorithmResult, graph)) {
            setError("Le graphe n'est pas connexe. L'arbre couvrant minimal ne couvre pas tous les nœuds.");
          }
        } else {
          algorithmResult = prim(graph, startNodeId);
          
          // Vérifier si l'ACM est complet
          if (!isPrimComplete(algorithmResult, graph)) {
            setError("Le graphe n'est pas connexe. L'arbre couvrant minimal ne couvre pas tous les nœuds.");
          }
        }
      }
      
      // Passer le résultat au composant parent
      runAlgorithm(algorithmResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'exécution de l\'algorithme');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie d'algorithme</label>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="traversal"
              checked={algorithmCategory === 'traversal'}
              onChange={() => setAlgorithmCategory('traversal')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Parcours de graphe</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="shortestPath"
              checked={algorithmCategory === 'shortestPath'}
              onChange={() => setAlgorithmCategory('shortestPath')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Plus courts chemins</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="minimumSpanningTree"
              checked={algorithmCategory === 'minimumSpanningTree'}
              onChange={() => setAlgorithmCategory('minimumSpanningTree')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Arbre couvrant minimal</span>
          </label>
        </div>
      </div>
      
      {/* Algorithmes de parcours */}
      {algorithmCategory === 'traversal' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Algorithme de parcours</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="dfs"
                checked={traversalAlgorithm === 'dfs'}
                onChange={() => setTraversalAlgorithm('dfs')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Parcours en profondeur (DFS)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="bfs"
                checked={traversalAlgorithm === 'bfs'}
                onChange={() => setTraversalAlgorithm('bfs')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Parcours en largeur (BFS)</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Algorithmes de plus courts chemins */}
      {algorithmCategory === 'shortestPath' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Algorithme de plus court chemin</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="dijkstra"
                checked={shortestPathAlgorithm === 'dijkstra'}
                onChange={() => setShortestPathAlgorithm('dijkstra')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Dijkstra (pas de poids négatifs)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="bellmanFord"
                checked={shortestPathAlgorithm === 'bellmanFord'}
                onChange={() => setShortestPathAlgorithm('bellmanFord')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Bellman-Ford (avec poids négatifs)</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Algorithmes d'arbre couvrant minimal */}
      {algorithmCategory === 'minimumSpanningTree' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Algorithme d'arbre couvrant minimal</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="kruskal"
                checked={mstAlgorithm === 'kruskal'}
                onChange={() => setMSTAlgorithm('kruskal')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Kruskal</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="prim"
                checked={mstAlgorithm === 'prim'}
                onChange={() => setMSTAlgorithm('prim')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Prim</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Sélection du nœud de départ */}
      {graph && (
        <div className="mb-4">
          <label htmlFor="startNode" className="block text-sm font-medium text-gray-700 mb-1">
            Nœud de départ
          </label>
          <select
            id="startNode"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
          >
            {graph.getNodes().map(node => (
              <option key={node.id} value={node.id}>
                {node.label || node.id}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Sélection du nœud d'arrivée pour les algorithmes de plus courts chemins */}
      {graph && algorithmCategory === 'shortestPath' && (
        <div className="mb-4">
          <label htmlFor="endNode" className="block text-sm font-medium text-gray-700 mb-1">
            Nœud d'arrivée
          </label>
          <select
            id="endNode"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={endNodeId}
            onChange={(e) => setEndNodeId(e.target.value)}
          >
            <option value="">Tous les nœuds</option>
            {graph.getNodes().map(node => (
              <option key={node.id} value={node.id} disabled={node.id === startNodeId}>
                {node.label || node.id}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <button
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={executeAlgorithm}
      >
        Exécuter {getCurrentAlgorithmName()}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default AlgorithmSelector;