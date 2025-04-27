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

interface ResultsPanelProps {
  result: any;
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
      
      {/* Résultats pour les algorithmes de parcours */}
      {algorithmCategory === 'traversal' && (
        <div>
          <div className="mb-4">
            <h3 className="font-medium mb-1">Ordre de visite:</h3>
            <p className="bg-gray-100 p-2 rounded overflow-x-auto">
              {result.visitedOrder.map((id: string, index: number) => {
                const node = graph?.getNodes().find(n => n.id === id);
                return `${index + 1}. ${node?.label || id}`;
              }).join(' → ')}
            </p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-1">Nœuds accessibles:</h3>
            <p className="bg-gray-100 p-2 rounded">
              {result.visitedNodes.size} sur {graph?.getNodes().length} nœuds
            </p>
          </div>
        </div>
      )}
      
      {/* Résultats pour les algorithmes de plus courts chemins */}
      {algorithmCategory === 'shortestPath' && (
        <div>
          <div className="mb-4">
            <h3 className="font-medium mb-1">Distances depuis {graph?.getNodes().find(n => n.id === startNodeId)?.label || startNodeId}:</h3>
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
                  {Array.from(result.distances.entries()).map(([nodeId, distance]: [string, number]) => {
                    const node = graph?.getNodes().find(n => n.id === nodeId);
                    const predecessor = result.predecessors.get(nodeId);
                    const predecessorNode = predecessor ? graph?.getNodes().find(n => n.id === predecessor) : null;
                    
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
          
          {endNodeId && result.path && (
            <div className="mb-4">
              <h3 className="font-medium mb-1">
                Chemin le plus court vers {graph?.getNodes().find(n => n.id === endNodeId)?.label || endNodeId}:
              </h3>
              <div className="bg-gray-100 p-2 rounded">
                <p className="font-medium mb-1">
                  Distance: {result.distances.get(endNodeId) === Infinity ? "∞ (inaccessible)" : result.distances.get(endNodeId)}
                </p>
                {result.path.length > 0 ? (
                  <p>
                    Chemin: {result.path.map((id: string) => {
                      const node = graph?.getNodes().find(n => n.id === id);
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
              <p className={`bg-gray-100 p-2 rounded ${result.hasNegativeCycle ? 'text-red-600 font-medium' : ''}`}>
                {result.hasNegativeCycle 
                  ? "Un cycle de poids négatif a été détecté dans le graphe. Les distances peuvent ne pas être correctes." 
                  : "Aucun cycle de poids négatif détecté."}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Résultats pour les algorithmes d'arbre couvrant minimal */}
      {algorithmCategory === 'minimumSpanningTree' && (
        <div>
          <div className="mb-4">
            <h3 className="font-medium mb-1">Arbre couvrant minimal:</h3>
            <p className="bg-gray-100 p-2 rounded font-medium">
              Poids total: {result.totalWeight}
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
                  {result.minimumSpanningTree.map((edge: Edge, index: number) => {
                    const sourceNode = graph?.getNodes().find(n => n.id === edge.source);
                    const targetNode = graph?.getNodes().find(n => n.id === edge.target);
                    
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
              {result.minimumSpanningTree.length} arêtes sur {graph?.getNodes().length && graph.getNodes().length - 1} nécessaires
              {result.minimumSpanningTree.length < (graph?.getNodes().length || 0) - 1 && (
                <span className="text-amber-600 ml-2 font-medium">
                  (Le graphe n'est pas connexe)
                </span>
              )}
            </p>
          </div>
        </div>
      )}
      
      {/* Explication de l'algorithme */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">À propos de {getCurrentAlgorithmName()}</h3>
        
        {algorithmCategory === 'traversal' && traversalAlgorithm === 'dfs' && (
          <p className="text-blue-800 text-sm">
            Le parcours en profondeur (DFS) explore un chemin aussi loin que possible avant de revenir 
            en arrière. Il est utile pour détecter des cycles, explorer des structures de données comme 
            les arbres et les graphes, et pour résoudre des labyrinthes.
          </p>
        )}
        
        {algorithmCategory === 'traversal' && traversalAlgorithm === 'bfs' && (
          <p className="text-blue-800 text-sm">
            Le parcours en largeur (BFS) explore tous les nœuds à une certaine distance avant 
            de passer aux nœuds plus éloignés. Il trouve le chemin le plus court dans un graphe 
            non pondéré et est utilisé pour l'analyse de réseaux sociaux et d'accessibilité.
          </p>
        )}
        
        {algorithmCategory === 'shortestPath' && shortestPathAlgorithm === 'dijkstra' && (
          <p className="text-blue-800 text-sm">
            L'algorithme de Dijkstra trouve les plus courts chemins d'un nœud source vers tous les autres
            nœuds dans un graphe pondéré. Il fonctionne uniquement avec des poids positifs et construit
            progressivement les chemins en choisissant toujours le nœud non visité avec la distance minimale.
          </p>
        )}
        
        {algorithmCategory === 'shortestPath' && shortestPathAlgorithm === 'bellmanFord' && (
          <p className="text-blue-800 text-sm">
            L'algorithme de Bellman-Ford trouve les plus courts chemins même en présence de poids négatifs.
            Il peut également détecter les cycles de poids négatifs. L'algorithme relaxe toutes les arêtes
            |V|-1 fois (où |V| est le nombre de nœuds) pour garantir les distances minimales.
          </p>
        )}
        
        {algorithmCategory === 'minimumSpanningTree' && mstAlgorithm === 'kruskal' && (
          <p className="text-blue-800 text-sm">
            L'algorithme de Kruskal construit un arbre couvrant minimal en ajoutant les arêtes par ordre de poids croissant,
            tout en évitant de créer des cycles. Il utilise une structure Union-Find pour gérer efficacement les ensembles
            de nœuds connectés.
          </p>
        )}
        
        {algorithmCategory === 'minimumSpanningTree' && mstAlgorithm === 'prim' && (
          <p className="text-blue-800 text-sm">
            L'algorithme de Prim construit un arbre couvrant minimal en commençant par un nœud et en ajoutant à chaque étape
            l'arête de poids minimal qui connecte l'arbre en construction à un nouveau nœud. Contrairement à Kruskal,
            Prim maintient un arbre unique qui s'étend progressivement.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;