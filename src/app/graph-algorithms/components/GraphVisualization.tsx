// src/app/graph-algorithms/components/GraphVisualization.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { GraphWeighted, Edge } from '@/lib/models/GraphWeighted';
import { AlgorithmCategory } from '../page';

interface GraphVisualizationProps {
  graph: GraphWeighted | null;
  result: any | null;
  algorithmCategory: AlgorithmCategory;
  startNodeId: string;
  endNodeId: string;
  isAnimating: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
  animationStep: number;
  setAnimationStep: (step: number) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  animationRef: React.MutableRefObject<number | null>;
  stopAnimation: () => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  graph,
  result,
  algorithmCategory,
  startNodeId,
  endNodeId,
  isAnimating,
  setIsAnimating,
  animationStep,
  setAnimationStep,
  animationSpeed,
  setAnimationSpeed,
  animationRef,
  stopAnimation
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Effet pour dessiner le graphe quand il change
  useEffect(() => {
    if (graph && result) {
      drawGraph(graph, result);
    }
  }, [graph, result, algorithmCategory, startNodeId, endNodeId]);
  
  // Fonction pour télécharger l'image du graphe
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `graph-${algorithmCategory}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Fonction pour dessiner le graphe avec les résultats de l'algorithme
  const drawGraph = (graph: GraphWeighted, algorithmResult: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Récupérer les dimensions du canvas
    const width = canvas.width;
    const height = canvas.height;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Récupérer les nœuds et les arêtes
    const nodes = graph.getNodes();
    const edges = graph.getEdges();
    
    // Calculer les positions des nœuds (disposition circulaire simple)
    const nodePositions = new Map<string, { x: number, y: number }>();
    const radius = Math.min(width, height) * 0.4;
    const centerX = width / 2;
    const centerY = height / 2;
    
    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      nodePositions.set(node.id, { x, y });
    });
    
    // Obtenir la plage de poids pour l'épaisseur des arêtes
    const weightRange = graph.getWeightRange();
    const minWeight = weightRange.min;
    const maxWeight = weightRange.max;
    const weightDiff = maxWeight - minWeight;
    
    // Fonction pour vérifier si une arête fait partie de la solution
    const isEdgeInSolution = (edge: Edge): boolean => {
      if (!algorithmResult) return false;
      
      if (algorithmCategory === 'minimumSpanningTree') {
        // Pour les algorithmes MST
        return algorithmResult.minimumSpanningTree.some((e: Edge) => 
          (e.source === edge.source && e.target === edge.target) || 
          (!graph.directed && e.source === edge.target && e.target === edge.source)
        );
      } else if (algorithmCategory === 'shortestPath' && algorithmResult.path) {
        // Pour les algorithmes de plus courts chemins avec un chemin
        for (let i = 0; i < algorithmResult.path.length - 1; i++) {
          const source = algorithmResult.path[i];
          const target = algorithmResult.path[i + 1];
          if ((source === edge.source && target === edge.target) || 
              (!graph.directed && source === edge.target && target === edge.source)) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    // Dessiner les arêtes
    edges.forEach(edge => {
      const source = nodePositions.get(edge.source);
      const target = nodePositions.get(edge.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        
        // Déterminer le style de ligne selon le résultat
        const inSolution = isEdgeInSolution(edge);
        
        if (inSolution) {
          ctx.strokeStyle = '#2563EB'; // Arêtes en surbrillance
          ctx.lineWidth = 3;
        } else {
          ctx.strokeStyle = '#9CA3AF';
          // Échelle d'épaisseur basée sur le poids
          const scaleFactor = weightDiff === 0 ? 1 : (edge.weight - minWeight) / weightDiff;
          ctx.lineWidth = 1 + scaleFactor * 2;
        }
        
        ctx.stroke();
        
        // Dessiner le poids de l'arête
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        
        // Fond blanc pour meilleure lisibilité
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(midX, midY, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = inSolution ? '#2563EB' : '#4B5563';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.weight.toString(), midX, midY);
        
        // Dessiner une flèche pour les graphes dirigés
        if (graph.directed) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const angle = Math.atan2(dy, dx);
          
          const headLength = 10;
          const arrowX = target.x - 15 * Math.cos(angle);
          const arrowY = target.y - 15 * Math.sin(angle);
          
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - headLength * Math.cos(angle - Math.PI / 6),
            arrowY - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            arrowX - headLength * Math.cos(angle + Math.PI / 6),
            arrowY - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = inSolution ? '#2563EB' : '#9CA3AF';
          ctx.fill();
        }
      }
    });
    
    // Dessiner les nœuds
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      
      // Déterminer la couleur du nœud en fonction de l'algorithme
      let fillColor = '#ddd';
      let isHighlighted = false;
      
      if (algorithmCategory === 'traversal' && algorithmResult?.visitedOrder) {
        // Pour les algorithmes de parcours
        const visitIndex = algorithmResult.visitedOrder.indexOf(node.id);
        if (visitIndex >= 0) {
          // Dégradé de couleur basé sur l'ordre de visite
          const ratio = visitIndex / (algorithmResult.visitedOrder.length - 1);
          const r = Math.floor(255 * ratio);
          const g = Math.floor(255 * (1 - ratio * 0.5));
          const b = Math.floor(100 * (1 - ratio));
          fillColor = `rgb(${r}, ${g}, ${b})`;
        }
      } else if (algorithmCategory === 'shortestPath') {
        // Pour les algorithmes de plus courts chemins
        if (node.id === startNodeId) {
          fillColor = '#3B82F6'; // Nœud de départ en bleu
          isHighlighted = true;
        } else if (node.id === endNodeId) {
          fillColor = '#EF4444'; // Nœud d'arrivée en rouge
          isHighlighted = true;
        } else if (algorithmResult?.path?.includes(node.id)) {
          fillColor = '#8B5CF6'; // Nœuds sur le chemin en violet
          isHighlighted = true;
        } else if (algorithmResult?.distances?.get(node.id) < Infinity) {
          // Dégradé basé sur la distance
          const distance = algorithmResult.distances.get(node.id);
          const maxDistance = Math.max(...Array.from(algorithmResult.distances.values()).filter(d => d < Infinity));
          const ratio = distance / maxDistance;
          const g = Math.floor(220 * (1 - ratio));
          fillColor = `rgb(220, ${g}, 220)`;
        }
      } else if (algorithmCategory === 'minimumSpanningTree') {
        // Pour les algorithmes MST
        const inMST = algorithmResult?.minimumSpanningTree.some((edge: Edge) => 
          edge.source === node.id || edge.target === node.id
        );
        
        if (inMST) {
          fillColor = '#10B981'; // Nœuds dans MST en vert
          isHighlighted = true;
        }
      }
      
      // Cas spécial pour le nœud de départ
      if (node.id === startNodeId) {
        fillColor = '#3B82F6'; // Nœud de départ en bleu
        isHighlighted = true;
      }
      
      // Dessiner le cercle du nœud
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = isHighlighted ? '#000' : '#666';
      ctx.lineWidth = isHighlighted ? 3 : 1;
      ctx.stroke();
      
      // Dessiner l'étiquette du nœud
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label || node.id, pos.x, pos.y);
      
      // Pour les algorithmes de plus courts chemins, afficher la distance si disponible
      if (algorithmCategory === 'shortestPath' && algorithmResult?.distances) {
        const distance = algorithmResult.distances.get(node.id);
        if (distance !== undefined && distance < Infinity) {
          ctx.beginPath();
          ctx.arc(pos.x + 20, pos.y - 15, 15, 0, 2 * Math.PI);
          ctx.fillStyle = '#FFF';
          ctx.fill();
          ctx.strokeStyle = '#666';
          ctx.lineWidth = 1;
          ctx.stroke();
          
          ctx.fillStyle = '#000';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(distance.toString(), pos.x + 20, pos.y - 15);
        }
      }
    });
  };
  
  // Fonction pour animer l'exécution de l'algorithme
  const animateAlgorithm = () => {
    if (!graph || !result) return;
    
    setIsAnimating(true);
    setAnimationStep(0);
    
    const totalSteps = getAnimationStepsCount();
    
    const animate = (step: number) => {
      if (step >= totalSteps) {
        setIsAnimating(false);
        return;
      }
      
      setAnimationStep(step + 1);
      drawGraphWithAnimation(graph, result, step + 1);
      
      animationRef.current = window.setTimeout(() => {
        animate(step + 1);
      }, animationSpeed);
    };
    
    animate(0);
  };
  
  // Fonction pour dessiner le graphe avec animation
  const drawGraphWithAnimation = (graph: GraphWeighted, algorithmResult: any, step: number) => {
    // Pour l'instant, on utilise simplement le même dessin que drawGraph
    // Une implémentation plus complète montrerait une animation spécifique à chaque étape
    // selon l'algorithme utilisé
    drawGraph(graph, algorithmResult);
    
    // Ajouter un compteur d'étapes
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 100, 30);
    ctx.fillStyle = '#FFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Étape: ${step}`, 20, 25);
  };
  
  // Obtenir le nombre d'étapes d'animation en fonction de l'algorithme
  const getAnimationStepsCount = (): number => {
    if (!result) return 0;
    
    if (algorithmCategory === 'traversal') {
      return result.visitedOrder?.length || 0;
    } else if (algorithmCategory === 'shortestPath') {
      return result.steps?.length || 0;
    } else if (algorithmCategory === 'minimumSpanningTree') {
      return result.steps?.length || 0;
    }
    
    return 0;
  };
  
  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full border border-gray-300 rounded-lg bg-gray-50"
        style={{ cursor: 'grab' }}
      />
      
      <div className="mt-4 mb-2">
        <h3 className="font-medium mb-2">Animation de l'algorithme</h3>
        <div className="flex flex-wrap items-center gap-4">
          <button
            className={`px-3 py-1 rounded ${isAnimating ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
            onClick={isAnimating ? stopAnimation : animateAlgorithm}
            disabled={!result}
          >
            {isAnimating ? 'Arrêter' : 'Animer l\'algorithme'}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Vitesse:</span>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="text-sm">{animationSpeed}ms</span>
          </div>
          
          {result && (
            <div className="text-sm">
              Étape: {animationStep} / {getAnimationStepsCount()}
            </div>
          )}
        </div>
      </div>
      
      <button
        className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        onClick={downloadImage}
        disabled={!graph}
      >
        Télécharger l'image
      </button>
      
      {/* Légende adaptative selon l'algorithme */}
      <div className="mt-4 border-t pt-4">
        <h3 className="font-medium mb-2">Légende:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {algorithmCategory === 'traversal' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border border-gray-400"></div>
                <span className="text-xs">Nœud de départ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border border-gray-400"></div>
                <span className="text-xs">Premiers nœuds visités</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border border-gray-400"></div>
                <span className="text-xs">Derniers nœuds visités</span>
              </div>
            </>
          )}
          
          {algorithmCategory === 'shortestPath' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border border-gray-400"></div>
                <span className="text-xs">Nœud de départ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border border-gray-400"></div>
                <span className="text-xs">Nœud d'arrivée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500 border border-gray-400"></div>
                <span className="text-xs">Nœuds sur le chemin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-blue-500"></div>
                <span className="text-xs">Arêtes du chemin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">D</div>
                </div>
                <span className="text-xs">Distances</span>
              </div>
            </>
          )}
          
          {algorithmCategory === 'minimumSpanningTree' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border border-gray-400"></div>
                <span className="text-xs">Nœuds dans l'ACM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-blue-500"></div>
                <span className="text-xs">Arêtes de l'ACM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border border-gray-400"></div>
                <span className="text-xs">Nœud de départ (Prim)</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphVisualization;