// src/app/graph-algorithms/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { GraphWeighted } from '@/lib/models/GraphWeighted';
import GraphInput from './components/GraphInput';
import AlgorithmSelector from './components/AlgorithmSelector';
import GraphVisualization from './components/GraphVisualization';
import ResultsPanel from './components/ResultsPanel';

// Types des algorithmes
export type AlgorithmCategory = 'traversal' | 'shortestPath' | 'minimumSpanningTree';
export type TraversalAlgorithm = 'dfs' | 'bfs';
export type ShortestPathAlgorithm = 'dijkstra' | 'bellmanFord';
export type MSTAlgorithm = 'kruskal' | 'prim';
export type GraphInputType = 'adjacencyMatrix' | 'adjacencyList';

export default function GraphAlgorithmsPage() {
  // État du graphe
  const [graph, setGraph] = useState<GraphWeighted | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // État des algorithmes
  const [algorithmCategory, setAlgorithmCategory] = useState<AlgorithmCategory>('traversal');
  const [traversalAlgorithm, setTraversalAlgorithm] = useState<TraversalAlgorithm>('dfs');
  const [shortestPathAlgorithm, setShortestPathAlgorithm] = useState<ShortestPathAlgorithm>('dijkstra');
  const [mstAlgorithm, setMSTAlgorithm] = useState<MSTAlgorithm>('kruskal');
  
  // État des nœuds
  const [startNodeId, setStartNodeId] = useState<string>('0');
  const [endNodeId, setEndNodeId] = useState<string>('');
  
  // État des résultats
  const [result, setResult] = useState<any | null>(null);
  
  // Animation
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  
  // Gestion de la direction du graphe (utile pour MST)
  const [isDirected, setIsDirected] = useState<boolean>(false);
  
  // Effet secondaire pour mettre à jour la direction si on change de catégorie
  React.useEffect(() => {
    if (algorithmCategory === 'minimumSpanningTree' && isDirected) {
      setIsDirected(false); // Les MST nécessitent un graphe non dirigé
    }
  }, [algorithmCategory, isDirected]);
  
  // Fonction d'exécution d'algorithme (sera passée aux composants enfants)
  const runAlgorithm = (algorithmResult: any) => {
    setResult(algorithmResult);
    setAnimationStep(0);
    stopAnimation();
  };
  
  // Fonction pour arrêter l'animation
  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };
  
  // Nettoyage des animations à la sortie
  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);
  
  // Helper pour obtenir le nom de l'algorithme actuel
  const getCurrentAlgorithmName = (): string => {
    if (algorithmCategory === 'traversal') {
      return traversalAlgorithm === 'dfs' ? 'Parcours en Profondeur (DFS)' : 'Parcours en Largeur (BFS)';
    } else if (algorithmCategory === 'shortestPath') {
      return shortestPathAlgorithm === 'dijkstra' ? 'Algorithme de Dijkstra' : 'Algorithme de Bellman-Ford';
    } else {
      return mstAlgorithm === 'kruskal' ? 'Algorithme de Kruskal' : 'Algorithme de Prim';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour à l'accueil
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Visualisation d'Algorithmes de Graphes</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panneau gauche: entrée et configuration */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Configuration du Graphe</h2>
            
            {/* Composant d'entrée de graphe */}
            <GraphInput 
              graph={graph}
              setGraph={setGraph}
              algorithmCategory={algorithmCategory}
              setError={setError}
              isDirected={isDirected}
              setIsDirected={setIsDirected}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Sélection de l'Algorithme</h2>
            
            {/* Composant de sélection d'algorithme */}
            <AlgorithmSelector 
              graph={graph}
              algorithmCategory={algorithmCategory}
              setAlgorithmCategory={setAlgorithmCategory}
              traversalAlgorithm={traversalAlgorithm}
              setTraversalAlgorithm={setTraversalAlgorithm}
              shortestPathAlgorithm={shortestPathAlgorithm}
              setShortestPathAlgorithm={setShortestPathAlgorithm}
              mstAlgorithm={mstAlgorithm}
              setMSTAlgorithm={setMSTAlgorithm}
              startNodeId={startNodeId}
              setStartNodeId={setStartNodeId}
              endNodeId={endNodeId}
              setEndNodeId={setEndNodeId}
              runAlgorithm={runAlgorithm}
              error={error}
              setError={setError}
              getCurrentAlgorithmName={getCurrentAlgorithmName}
            />
          </div>
        </div>
        
        {/* Panneau droit: visualisation et résultats */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Visualisation du Graphe</h2>
            
            {/* Composant de visualisation */}
            <GraphVisualization 
              graph={graph}
              result={result}
              algorithmCategory={algorithmCategory}
              startNodeId={startNodeId}
              endNodeId={endNodeId}
              isAnimating={isAnimating}
              setIsAnimating={setIsAnimating}
              animationStep={animationStep}
              setAnimationStep={setAnimationStep}
              animationSpeed={animationSpeed}
              setAnimationSpeed={setAnimationSpeed}
              animationRef={animationRef}
              stopAnimation={stopAnimation}
            />
          </div>
          
          {/* Affichage des résultats conditionnels */}
          {result && (
            <ResultsPanel 
              result={result}
              graph={graph}
              algorithmCategory={algorithmCategory}
              startNodeId={startNodeId}
              endNodeId={endNodeId}
              traversalAlgorithm={traversalAlgorithm}
              shortestPathAlgorithm={shortestPathAlgorithm}
              mstAlgorithm={mstAlgorithm}
              getCurrentAlgorithmName={getCurrentAlgorithmName}
            />
          )}
        </div>
      </div>
    </div>
  );
}