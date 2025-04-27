// src/app/graph-algorithms/components/GraphInput.tsx
'use client';

import React, { useState } from 'react';
import { GraphWeighted } from '@/lib/models/GraphWeighted';
import { AlgorithmCategory } from '../page';

interface GraphInputProps {
  graph: GraphWeighted | null;
  setGraph: (graph: GraphWeighted | null) => void;
  algorithmCategory: AlgorithmCategory;
  setError: (error: string | null) => void;
  isDirected: boolean;
  setIsDirected: (isDirected: boolean) => void;
}

type GraphInputType = 'adjacencyMatrix' | 'adjacencyList';

const GraphInput: React.FC<GraphInputProps> = ({
  graph,
  setGraph,
  algorithmCategory,
  setError,
  isDirected,
  setIsDirected
}) => {
  // États locaux
  const [graphInputType, setGraphInputType] = useState<GraphInputType>('adjacencyMatrix');
  const [graphInput, setGraphInput] = useState<string>('');
  const [nodeLabels, setNodeLabels] = useState<string>('');
  
  // Fonction pour créer le graphe
  const createGraph = () => {
    try {
      setError(null);
      let newGraph: GraphWeighted;
      
      if (graphInputType === 'adjacencyMatrix') {
        // Parser la matrice d'adjacence
        const matrix = graphInput
          .trim()
          .split('\n')
          .map(row => row.trim().split(/\s+/).map(Number));
        
        // Vérifier que la matrice est carrée
        const size = matrix.length;
        if (!matrix.every(row => row.length === size)) {
          throw new Error('La matrice d\'adjacence doit être carrée');
        }
        
        // Parser les labels des nœuds si fournis
        const labels = nodeLabels.trim() ? nodeLabels.trim().split(/\s*,\s*/) : undefined;
        
        // Créer le graphe
        newGraph = GraphWeighted.fromAdjacencyMatrix(matrix, labels);
      } else {
        // Parser la liste d'adjacence (maintenant avec poids entre parenthèses)
        const lines = graphInput.trim().split('\n');
        
        // Créer le graphe
        newGraph = GraphWeighted.fromAdjacencyList(lines);
      }
      
      // Mettre à jour la direction du graphe
      newGraph.directed = isDirected;
      setGraph(newGraph);
      
      return newGraph;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création du graphe');
      return null;
    }
  };
  
  // Fonction pour charger un exemple
  const setExampleGraph = () => {
    if (algorithmCategory === 'traversal') {
      if (graphInputType === 'adjacencyMatrix') {
        setGraphInput(
          "0 1 0 0 1\n" +
          "1 0 1 1 1\n" +
          "0 1 0 1 0\n" +
          "0 1 1 0 1\n" +
          "1 1 0 1 0"
        );
        setNodeLabels("A, B, C, D, E");
      } else {
        setGraphInput(
          "A: B, E\n" +
          "B: A, C, D, E\n" +
          "C: B, D\n" +
          "D: B, C, E\n" +
          "E: A, B, D"
        );
      }
    } else if (algorithmCategory === 'shortestPath') {
      if (graphInputType === 'adjacencyMatrix') {
        setGraphInput(
          "0 4 0 0 8\n" +
          "4 0 3 2 5\n" +
          "0 3 0 7 0\n" +
          "0 2 7 0 6\n" +
          "8 5 0 6 0"
        );
        setNodeLabels("A, B, C, D, E");
      } else {
        setGraphInput(
          "A: B(4), E(8)\n" +
          "B: A(4), C(3), D(2), E(5)\n" +
          "C: B(3), D(7)\n" +
          "D: B(2), C(7), E(6)\n" +
          "E: A(8), B(5), D(6)"
        );
      }
    } else if (algorithmCategory === 'minimumSpanningTree') {
      if (graphInputType === 'adjacencyMatrix') {
        setGraphInput(
          "0 2 0 6 0\n" +
          "2 0 3 8 5\n" +
          "0 3 0 0 7\n" +
          "6 8 0 0 9\n" +
          "0 5 7 9 0"
        );
        setNodeLabels("A, B, C, D, E");
      } else {
        setGraphInput(
          "A: B(2), D(6)\n" +
          "B: A(2), C(3), D(8), E(5)\n" +
          "C: B(3), E(7)\n" +
          "D: A(6), B(8), E(9)\n" +
          "E: B(5), C(7), D(9)"
        );
      }
    }
  };
  
  // Fonction pour exporter la configuration
  const exportConfig = () => {
    const config = {
      graphInputType,
      graphInput,
      nodeLabels,
      isDirected
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "graph-config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };
  
  // Fonction pour importer une configuration
  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        setGraphInputType(config.graphInputType || 'adjacencyMatrix');
        setGraphInput(config.graphInput || '');
        setNodeLabels(config.nodeLabels || '');
        setIsDirected(config.isDirected || false);
        
        // Recréer le graphe
        setTimeout(() => createGraph(), 100);
      } catch (err) {
        setError("Erreur lors de l'importation: format de fichier invalide");
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Type d'entrée</label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="adjacencyMatrix"
              checked={graphInputType === 'adjacencyMatrix'}
              onChange={() => setGraphInputType('adjacencyMatrix')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Matrice d'adjacence</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="adjacencyList"
              checked={graphInputType === 'adjacencyList'}
              onChange={() => setGraphInputType('adjacencyList')}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Liste d'adjacence</span>
          </label>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Type de graphe</label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="undirected"
              checked={!isDirected}
              onChange={() => setIsDirected(false)}
              disabled={algorithmCategory === 'minimumSpanningTree'}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Non dirigé</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="directed"
              checked={isDirected}
              onChange={() => setIsDirected(true)}
              disabled={algorithmCategory === 'minimumSpanningTree'}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Dirigé</span>
            {algorithmCategory === 'minimumSpanningTree' && 
              <span className="ml-2 text-xs text-red-500">(Non disponible pour ACM)</span>
            }
          </label>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="graphInput" className="block text-sm font-medium text-gray-700 mb-1">
          {graphInputType === 'adjacencyMatrix' ? 'Matrice d\'adjacence' : 'Liste d\'adjacence'}
        </label>
        <textarea
          id="graphInput"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={graphInput}
          onChange={(e) => setGraphInput(e.target.value)}
          placeholder={graphInputType === 'adjacencyMatrix' 
            ? "0 4 0\n4 0 2\n0 2 0" 
            : "A: B(4), C(2)\nB: A(4), C(1)\nC: A(2), B(1)"}
        />
        <p className="mt-1 text-sm text-gray-500">
          {graphInputType === 'adjacencyMatrix' 
            ? 'Entrez les poids des arêtes (0 pour aucune connexion)' 
            : 'Format: Nœud: Voisin1(poids1), Voisin2(poids2), ... - Exemple: A: B(4), C(2)'}
        </p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="nodeLabels" className="block text-sm font-medium text-gray-700 mb-1">
          {graphInputType === 'adjacencyMatrix' 
            ? 'Labels des nœuds (séparés par des virgules)' 
            : 'Labels des nœuds (optionnel)'}
        </label>
        <textarea
          id="nodeLabels"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={nodeLabels}
          onChange={(e) => setNodeLabels(e.target.value)}
          placeholder={graphInputType === 'adjacencyMatrix' 
            ? "A, B, C" 
            : ""}
        />
        <p className="mt-1 text-sm text-gray-500">
          {graphInputType === 'adjacencyMatrix' 
            ? 'Optionnel: noms des nœuds dans l\'ordre de la matrice' 
            : 'Pour la liste d\'adjacence, les labels sont déjà définis par les IDs'}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-2">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={setExampleGraph}
        >
          Charger un exemple
        </button>
        
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={createGraph}
        >
          Générer le graphe
        </button>
        
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          onClick={exportConfig}
          disabled={!graph}
        >
          Exporter
        </button>
        
        <label className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer">
          Importer
          <input
            type="file"
            accept=".json"
            onChange={importConfig}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default GraphInput;