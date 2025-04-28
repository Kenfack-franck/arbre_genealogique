// src/app/graph-algorithms/components/ResultsPanel.tsx
'use client';

import React from 'react';
import { GraphWeighted, Edge } from '@/lib/models/GraphWeighted';
import {
  AlgorithmCategory,
  TraversalAlgorithm,
  ShortestPathAlgorithm,
  MSTAlgorithm
} from '../page';

// Définir les types corrects pour "result"
interface TraversalResult {
  visitedOrder: string[];
  visitedNodes: Set<string>;
}

interface ShortestPathResult {
  distances: Map<string, number>;
  predecessors: Map<string, string | null>;
  path: string[];
  hasNegativeCycle?: boolean;
}

interface MSTResult {
  totalWeight: number;
  minimumSpanningTree: Edge[];
}

type ResultType = TraversalResult | ShortestPathResult | MSTResult;

interface ResultsPanelProps {
  result: ResultType;
  graph: GraphWeighted | null;
  algorithmCategory: AlgorithmCategory;
  startNodeId: string;
  endNodeId: string;
  traversalAlgorithm: TraversalAlgorithm;
  shortestPathAlgorithm: ShortestPathAlgorithm;
  mstAlgorithm: MSTAlgorithm;
  getCurrentAlgorithmName: () => string;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  graph,
  algorithmCategory,
  startNodeId,
  endNodeId,
  traversalAlgorithm,
  shortestPathAlgorithm,
  mstAlgorithm,
  getCurrentAlgorithmName
}) => {
  if (!result || !graph) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Résultats de {getCurrentAlgorithmName()}</h2>

      {/* Traversal algorithms */}
      {algorithmCategory === 'traversal' && (
        <div>
          <div className="mb-4">
            <h3 className="font-medium mb-1">Ordre de visite:</h3>
            <p className="bg-gray-100 p-2 rounded overflow-x-auto">
              {(result as TraversalResult).visitedOrder.map((id, index) => {
                const node = graph?.getNodes().find(n => n.id === id);
                return `${index + 1}. ${node?.label || id}`;
              }).join(' → ')}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-1">Nœuds accessibles:</h3>
            <p className="bg-gray-100 p-2 rounded">
              {(result as TraversalResult).visitedNodes.size} sur {graph.getNodes().length} nœuds
            </p>
          </div>
        </div>
      )}

      {/* Shortest path algorithms */}
      {algorithmCategory === 'shortestPath' && (
        <div>
          <div className="mb-4">
            <h3 className="font-medium mb-1">
              Distances depuis {graph.getNodes().find(n => n.id === startNodeId)?.label || startNodeId}:
            </h3>
            <div className="bg-gray-100 p-2 rounded max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-1">Nœud</th>
                    <th className="text-left p-1">Distance</th>
                    <th className="text-left p-1">Prédécesseur</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from((result as ShortestPathResult).distances.entries()).map(([nodeId, distance]) => {
                    const node = graph.getNodes().find(n => n.id === nodeId);
                    const predecessor = (result as ShortestPathResult).predecessors.get(nodeId);
                    const predecessorNode = predecessor ? graph.getNodes().find(n => n.id === predecessor) : null;

                    return (
                      <tr key={nodeId} className="border-t border-gray-200">
                        <td className="p-1 font-medium">{node?.label || nodeId}</td>
                        <td className="p-1">{distance === Infinity ? "∞" : distance}</td>
                        <td className="p-1">{predecessorNode?.label || predecessor || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {endNodeId && (result as ShortestPathResult).path && (
            <div className="mb-4">
              <h3 className="font-medium mb-1">
                Chemin le plus court vers {graph.getNodes().find(n => n.id === endNodeId)?.label || endNodeId}:
              </h3>
              <div className="bg-gray-100 p-2 rounded">
                <p className="font-medium mb-1">
                  Distance: {(result as ShortestPathResult).distances.get(endNodeId) === Infinity
                    ? "∞ (inaccessible)"
                    : (result as ShortestPathResult).distances.get(endNodeId)}
                </p>
                {(result as ShortestPathResult).path.length > 0 ? (
                  <p>
                    Chemin: {(result as ShortestPathResult).path.map(id => {
                      const node = graph.getNodes().find(n => n.id === id);
                      return node?.label || id;
                    }).join(' → ')}
                  </p>
                ) : (
                  <p>Aucun chemin trouvé</p>
                )}
              </div>
            </div>
          )}

          {shortestPathAlgorithm === 'bellmanFord' && (
            <div className="mb-4">
              <h3 className="font-medium mb-1">Détection de cycle négatif:</h3>
              <p className={`bg-gray-100 p-2 rounded ${(result as ShortestPathResult).hasNegativeCycle ? 'text-red-600 font-medium' : ''}`}>
                {(result as ShortestPathResult).hasNegativeCycle
                  ? "Un cycle de poids négatif a été détecté dans le graphe."
                  : "Aucun cycle de poids négatif détecté."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Minimum spanning tree algorithms */}
      {algorithmCategory === 'minimumSpanningTree' && (
        <div>
          <div className="mb-4">
            <h3 className="font-medium mb-1">Arbre couvrant minimal:</h3>
            <p className="bg-gray-100 p-2 rounded font-medium">
              Poids total: {(result as MSTResult).totalWeight}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-1">Arêtes de l'ACM:</h3>
            <div className="bg-gray-100 p-2 rounded max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-1">#</th>
                    <th className="text-left p-1">De</th>
                    <th className="text-left p-1">Vers</th>
                    <th className="text-right p-1">Poids</th>
                  </tr>
                </thead>
                <tbody>
                  {(result as MSTResult).minimumSpanningTree.map((edge, index) => {
                    const sourceNode = graph.getNodes().find(n => n.id === edge.source);
                    const targetNode = graph.getNodes().find(n => n.id === edge.target);

                    return (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="p-1">{index + 1}</td>
                        <td className="p-1">{sourceNode?.label || edge.source}</td>
                        <td className="p-1">{targetNode?.label || edge.target}</td>
                        <td className="p-1 text-right">{edge.weight}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-1">Couverture:</h3>
            <p className="bg-gray-100 p-2 rounded">
              {(result as MSTResult).minimumSpanningTree.length} arêtes sur {graph.getNodes().length - 1} nécessaires
              {(result as MSTResult).minimumSpanningTree.length < (graph.getNodes().length - 1) && (
                <span className="text-amber-600 ml-2 font-medium">
                  (Le graphe n'est pas connexe)
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
