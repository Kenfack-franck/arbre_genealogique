// src/app/full-tree/page.tsx
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFamily } from '@/context/FamilyContext';
import { Person } from '@/lib/models/Person';
import { Family } from '@/lib/models/Families';
import { Relationship } from '@/lib/models/Relationship';

// Constantes pour la mise en page de l'arbre
const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;
const LEVEL_HEIGHT = 180;
const SIBLING_SPACING = 220;

// Interface pour les noeuds de l'arbre
interface TreeNode {
  id: string;
  person: Person;
  x: number;
  y: number;
  level: number;
  width: number; // Largeur totale du sous-arbre
  childrenIds: string[];
  parentIds: string[];
  spouseIds: string[];
}

// Interface pour les liens de l'arbre
interface TreeEdge {
  id: string;
  source: string;
  target: string;
  type: 'parent-child' | 'spouse';
  points?: { x: number; y: number }[]; // Points supplémentaires pour les courbes
}

export default function FullTreePage() {
  const searchParams = useSearchParams();
  const familyIdParam = searchParams.get('familyId');
  
  const { families, activeFamily, loading } = useFamily();
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1600, height: 900 });
  
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [treeEdges, setTreeEdges] = useState<TreeEdge[]>([]);
  const [treeBounds, setTreeBounds] = useState({ minX: 0, minY: 0, maxX: 0, maxY: 0 });

  // Déterminer la famille actuelle
  useEffect(() => {
    if (!loading && families.length > 0) {
      let family: Family | null = null;
      
      if (familyIdParam) {
        family = families.find(f => f.id === familyIdParam) || null;
      } else if (activeFamily) {
        family = activeFamily;
      }
      
      setCurrentFamily(family);
    }
  }, [loading, families, activeFamily, familyIdParam]);

  // Générer l'arbre complet quand la famille change
  useEffect(() => {
    if (currentFamily && currentFamily.persons.length > 0) {
      const { nodes, edges, bounds } = generateFullTreeLayout(currentFamily);
      setTreeNodes(nodes);
      setTreeEdges(edges);
      setTreeBounds(bounds);
      
      // Réinitialiser la vue pour montrer tout l'arbre
      const padding = 100; // Espace autour de l'arbre
      setViewBox({
        x: bounds.minX - padding,
        y: bounds.minY - padding,
        width: (bounds.maxX - bounds.minX) + (padding * 2),
        height: (bounds.maxY - bounds.minY) + (padding * 2)
      });
    } else {
      setTreeNodes([]);
      setTreeEdges([]);
    }
  }, [currentFamily]);

  // Fonction pour générer la disposition complète de l'arbre
  function generateFullTreeLayout(family: Family) {
    const nodes: TreeNode[] = [];
    const edges: TreeEdge[] = [];
    const personMap = new Map<string, Person>();
    
    // Construire un map pour un accès rapide
    family.persons.forEach(person => {
      personMap.set(person.id, person);
    });
    
    // Identifier les personnes qui n'ont pas de parents dans l'arbre
    const childrenSet = new Set<string>();
    family.relationships.forEach(rel => {
      if (rel.type === 'parent') {
        childrenSet.add(rel.targetId);
      }
    });
    
    const rootPersons = family.persons.filter(person => !childrenSet.has(person.id));
    
    // Construire l'arbre à partir des personnes racines
    const processedPersons = new Set<string>();
    const nodeMap = new Map<string, TreeNode>();
    
    // Fonction pour obtenir les parents d'une personne
    const getParents = (personId: string) => {
      return family.relationships
        .filter(rel => rel.type === 'parent' && rel.targetId === personId)
        .map(rel => rel.sourceId);
    };
    
    // Fonction pour obtenir les enfants d'une personne
    const getChildren = (personId: string) => {
      return family.relationships
        .filter(rel => rel.type === 'parent' && rel.sourceId === personId)
        .map(rel => rel.targetId);
    };
    
    // Fonction pour obtenir les conjoints d'une personne
    const getSpouses = (personId: string) => {
      return family.relationships
        .filter(rel => rel.type === 'conjoint' && (rel.sourceId === personId || rel.targetId === personId))
        .map(rel => rel.sourceId === personId ? rel.targetId : rel.sourceId);
    };
    
    // Créer les objets TreeNode initiaux
    for (const person of family.persons) {
      const node: TreeNode = {
        id: person.id,
        person,
        x: 0,
        y: 0,
        level: 0,
        width: NODE_WIDTH,
        childrenIds: getChildren(person.id),
        parentIds: getParents(person.id),
        spouseIds: getSpouses(person.id)
      };
      
      nodeMap.set(person.id, node);
    }
    
    // Fonction pour calculer la largeur d'un sous-arbre
    const calculateSubtreeWidth = (nodeId: string, level: number, visited = new Set<string>()): number => {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);
      
      const node = nodeMap.get(nodeId)!;
      node.level = level;
      
      // Si pas d'enfants, retourner la largeur de base
      if (node.childrenIds.length === 0) {
        return NODE_WIDTH;
      }
      
      // Calculer la largeur totale des enfants
      let totalChildWidth = 0;
      for (const childId of node.childrenIds) {
        totalChildWidth += calculateSubtreeWidth(childId, level + 1, visited);
      }
      
      // Ajouter de l'espace entre les frères et sœurs
      if (node.childrenIds.length > 1) {
        totalChildWidth += (node.childrenIds.length - 1) * SIBLING_SPACING;
      }
      
      // Si la largeur des enfants est plus grande que le nœud, utiliser cette largeur
      node.width = Math.max(NODE_WIDTH, totalChildWidth);
      return node.width;
    };
    
    // Fonction pour positionner les nœuds
    const positionNodes = (nodeId: string, x: number, y: number, visited = new Set<string>()) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodeMap.get(nodeId)!;
      node.x = x;
      node.y = y;
      
      // Positionner les enfants
      if (node.childrenIds.length > 0) {
        const totalChildWidth = node.childrenIds.reduce((sum, childId) => {
          const childNode = nodeMap.get(childId)!;
          return sum + childNode.width;
        }, 0) + (node.childrenIds.length - 1) * SIBLING_SPACING;
        
        let childX = x - (totalChildWidth / 2);
        for (const childId of node.childrenIds) {
          const childNode = nodeMap.get(childId)!;
          childX += childNode.width / 2;
          positionNodes(childId, childX, y + LEVEL_HEIGHT, visited);
          childX += childNode.width / 2 + SIBLING_SPACING;
          
          // Ajouter une arête entre le parent et l'enfant
          edges.push({
            id: `edge-parent-child-${node.id}-${childId}`,
            source: node.id,
            target: childId,
            type: 'parent-child'
          });
        }
      }
      
      // Positionner les conjoints (à droite)
      let spouseX = x + NODE_WIDTH + 50;
      for (const spouseId of node.spouseIds) {
        if (!visited.has(spouseId)) {
          const spouseNode = nodeMap.get(spouseId)!;
          spouseNode.x = spouseX;
          spouseNode.y = y;
          spouseNode.level = node.level;
          visited.add(spouseId);
          
          // Positionner les enfants en commun
          const commonChildren = node.childrenIds.filter(id => spouseNode.childrenIds.includes(id));
          if (commonChildren.length > 0) {
            const childY = y + LEVEL_HEIGHT;
            for (const childId of commonChildren) {
              if (!visited.has(childId)) {
                positionNodes(childId, (x + spouseX) / 2, childY, visited);
              }
            }
          }
          
          // Ajouter une arête entre les conjoints
          edges.push({
            id: `edge-spouse-${node.id}-${spouseId}`,
            source: node.id,
            target: spouseId,
            type: 'spouse'
          });
          
          spouseX += NODE_WIDTH + 50;
        }
      }
    };
    
    // Calculer la largeur pour les personnes racines
    for (const rootPerson of rootPersons) {
      if (!processedPersons.has(rootPerson.id)) {
        calculateSubtreeWidth(rootPerson.id, 0, processedPersons);
      }
    }
    
    // Réinitialiser le set pour le positionnement
    processedPersons.clear();
    
    // Positionner les nœuds racines et leurs descendances
    let rootX = 0;
    for (const rootPerson of rootPersons) {
      if (!processedPersons.has(rootPerson.id)) {
        const node = nodeMap.get(rootPerson.id)!;
        rootX += node.width / 2;
        positionNodes(rootPerson.id, rootX, 100, processedPersons);
        rootX += node.width / 2 + SIBLING_SPACING;
      }
    }
    
    // Convertir le Map en tableau de nœuds
    nodeMap.forEach(node => {
      nodes.push(node);
    });
    
    // Améliorer la mise en page pour éviter les chevauchements
    optimizeLayout(nodes, edges);
    
    // Calculer les limites de l'arbre
    const bounds = calculateTreeBounds(nodes);
    
    return { nodes, edges, bounds };
  }
  
  // Fonction pour optimiser la mise en page et éviter les chevauchements
  function optimizeLayout(nodes: TreeNode[], edges: TreeEdge[]) {
    // Tri des nœuds par niveau pour traiter les niveaux indépendamment
    nodes.sort((a, b) => a.level - b.level);
    
    // Traiter chaque niveau
    const levelGroups = new Map<number, TreeNode[]>();
    nodes.forEach(node => {
      if (!levelGroups.has(node.level)) {
        levelGroups.set(node.level, []);
      }
      levelGroups.get(node.level)!.push(node);
    });
    
    // Pour chaque niveau, vérifier et résoudre les chevauchements
    levelGroups.forEach((levelNodes, level) => {
      // Trier les nœuds par position X
      levelNodes.sort((a, b) => a.x - b.x);
      
      // Vérifier et corriger les chevauchements
      for (let i = 1; i < levelNodes.length; i++) {
        const prevNode = levelNodes[i - 1];
        const currNode = levelNodes[i];
        
        const minDistance = (NODE_WIDTH / 2) + (NODE_WIDTH / 2) + 20; // Espace minimal entre les centres
        const actualDistance = currNode.x - prevNode.x;
        
        if (actualDistance < minDistance) {
          // Déplacer le nœud actuel et tous les suivants
          const shift = minDistance - actualDistance;
          for (let j = i; j < levelNodes.length; j++) {
            levelNodes[j].x += shift;
          }
        }
      }
    });
    
    // Mettre à jour les arêtes pour qu'elles suivent des courbes plus naturelles
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        if (edge.type === 'parent-child') {
          // Créer une courbe pour les relations parent-enfant
          edge.points = [
            { x: sourceNode.x, y: sourceNode.y + (NODE_HEIGHT / 2) },
            { x: sourceNode.x, y: sourceNode.y + (NODE_HEIGHT / 2) + 20 },
            { x: targetNode.x, y: targetNode.y - (NODE_HEIGHT / 2) - 20 },
            { x: targetNode.x, y: targetNode.y - (NODE_HEIGHT / 2) }
          ];
        } else if (edge.type === 'spouse') {
          // Ligne droite pour les conjoints
          edge.points = [
            { x: sourceNode.x + (NODE_WIDTH / 2), y: sourceNode.y },
            { x: targetNode.x - (NODE_WIDTH / 2), y: targetNode.y }
          ];
        }
      }
    });
  }
  
  // Fonction pour calculer les limites de l'arbre
  function calculateTreeBounds(nodes: TreeNode[]) {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    nodes.forEach(node => {
      const halfWidth = NODE_WIDTH / 2;
      const halfHeight = NODE_HEIGHT / 2;
      
      minX = Math.min(minX, node.x - halfWidth);
      minY = Math.min(minY, node.y - halfHeight);
      maxX = Math.max(maxX, node.x + halfWidth);
      maxY = Math.max(maxY, node.y + halfHeight);
    });
    
    return { minX, minY, maxX, maxY };
  }

  // Fonction de zoom
  const handleZoom = (factor: number) => {
    setZoomLevel(prev => {
      const newZoom = prev * factor;
      // Limites de zoom
      return Math.min(Math.max(newZoom, 0.2), 3);
    });
    
    setViewBox(prev => ({
      x: prev.x,
      y: prev.y,
      width: prev.width / factor,
      height: prev.height / factor
    }));
  };

  // Gestionnaires pour le glisser-déposer
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Click gauche
      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragState.isDragging && svgRef.current) {
      const dx = (e.clientX - dragState.startX) * (viewBox.width / svgRef.current.clientWidth);
      const dy = (e.clientY - dragState.startY) * (viewBox.height / svgRef.current.clientHeight);
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy
      }));
      
      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY
      });
    }
  };

  const handleMouseUp = () => {
    setDragState({ isDragging: false, startX: 0, startY: 0 });
  };

  // Fonction pour centrer la vue sur une personne
  const handleCenterOnPerson = (personId: string) => {
    const node = treeNodes.find(n => n.id === personId);
    if (node && svgRef.current) {
      const newViewBox = {
        x: node.x - (viewBox.width / 2),
        y: node.y - (viewBox.height / 2),
        width: viewBox.width,
        height: viewBox.height
      };
      setViewBox(newViewBox);
    }
  };

  // Fonction pour sélectionner une personne
  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(prev => prev?.id === person.id ? null : person);
  };

  // Fonction pour réinitialiser la vue
  const handleResetView = () => {
    const padding = 100;
    setViewBox({
      x: treeBounds.minX - padding,
      y: treeBounds.minY - padding,
      width: (treeBounds.maxX - treeBounds.minX) + (padding * 2),
      height: (treeBounds.maxY - treeBounds.minY) + (padding * 2)
    });
    setZoomLevel(1);
  };

  // Rendu des mini-cartes pour les personnes (pour la navigation)
  const renderPersonMiniCards = useMemo(() => {
    if (!currentFamily || currentFamily.persons.length === 0) return null;
    
    // Regrouper par famille (optionnel)
    const sortedPersons = [...currentFamily.persons]
      .sort((a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom));
    
    return (
      <div className="max-h-96 overflow-y-auto pr-2">
        <div className="mb-2">
          <input 
            type="text" 
            placeholder="Rechercher une personne..." 
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        
        <ul className="space-y-1">
          {sortedPersons.map(person => (
            <li key={person.id} className="text-sm">
              <button 
                onClick={() => handleCenterOnPerson(person.id)}
                className={`w-full text-left px-2 py-1 rounded hover:bg-blue-50 flex items-center ${
                  selectedPerson?.id === person.id ? 'bg-blue-100' : ''
                }`}
              >
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  person.sexe === 'M' ? 'bg-blue-500' : 
                  person.sexe === 'F' ? 'bg-pink-500' : 
                  'bg-purple-500'
                }`}></div>
                <span className="truncate">{person.prenom} {person.nom}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }, [currentFamily, selectedPerson]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement des données...</h2>
          <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!currentFamily) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Aucun arbre généalogique sélectionné</h2>
          <p className="text-gray-600 mb-6">Veuillez sélectionner un arbre généalogique pour visualiser l'arbre complet.</p>
          <Link href="/family" className="btn btn-primary">
            Voir mes arbres généalogiques
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/family/${currentFamily.id}`} className="text-blue-600 hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour à {currentFamily.name}
        </Link>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Arbre Complet - {currentFamily.name}</h1>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleZoom(1.2)}
            className="btn btn-secondary px-4 py-2"
            title="Zoom avant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="btn btn-secondary px-4 py-2"
            title="Zoom arrière"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleResetView}
            className="btn btn-secondary px-4 py-2"
            title="Réinitialiser la vue"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
          
          <Link 
            href={`/tree?familyId=${currentFamily.id}`} 
            className="btn btn-primary px-4 py-2"
            title="Vue centrée sur une personne"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Panneau de navigation */}
        <div className="md:w-64 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">Membres de la famille</h2>
          {renderPersonMiniCards}
        </div>
        
        {/* Visualisation principale de l'arbre */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4 overflow-hidden">
          <div 
            className="w-full h-[calc(100vh-280px)] border border-gray-200 rounded-lg overflow-hidden"
            style={{ cursor: dragState.isDragging ? 'grabbing' : 'grab' }}
          >
            {treeNodes.length > 0 ? (
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Lignes de connexion avec courbes */}
                {treeEdges.map(edge => {
                  if (edge.points && edge.points.length > 0) {
                    // Utiliser des courbes Bézier pour les connexions
                    if (edge.type === 'parent-child') {
                      const points = edge.points;
                      return (
                        <path
                          key={edge.id}
                          d={`M ${points[0].x} ${points[0].y} 
                             C ${points[1].x} ${points[1].y},
                               ${points[2].x} ${points[2].y},
                               ${points[3].x} ${points[3].y}`}
                          stroke={edge.type === 'spouse' ? '#F87171' : '#60A5FA'}
                          strokeWidth="2"
                          strokeDasharray={edge.type === 'spouse' ? "5,5" : ""}
                          fill="none"
                        />
                      );
                    } else if (edge.type === 'spouse') {
                      const points = edge.points;
                      return (
                        <line
                          key={edge.id}
                          x1={points[0].x}
                          y1={points[0].y}
                          x2={points[1].x}
                          y2={points[1].y}
                          stroke="#F87171"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                      );
                    }
                  }
                  return null;
                })}
                
                {/* Nœuds de l'arbre */}
                {treeNodes.map(node => {
                  const isSelected = selectedPerson?.id === node.id;
                  const isMale = node.person.sexe === 'M';
                  const isFemale = node.person.sexe === 'F';
                  
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x - NODE_WIDTH/2}, ${node.y - NODE_HEIGHT/2})`}
                      onClick={() => handleSelectPerson(node.person)}
                      className="cursor-pointer"
                      style={{ transition: 'transform 0.2s' }}
                    >
                      <rect
                        width={NODE_WIDTH}
                        height={NODE_HEIGHT}
                        rx="8"
                        ry="8"
                        fill={isMale ? '#DBEAFE' : isFemale ? '#FCE7F3' : '#F3F4F6'}
                        stroke={isSelected ? '#2563EB' : '#9CA3AF'}
                        strokeWidth={isSelected ? "3" : "1"}
                        className="shadow-md"
                      />
                      <text
                        x={NODE_WIDTH / 2}
                        y="30"
                        textAnchor="middle"
                        className="text-sm font-medium"
                        fill="#111827"
                      >
                        {node.person.prenom}
                      </text>
                      <text
                        x={NODE_WIDTH / 2}
                        y="50"
                        textAnchor="middle"
                        className="text-sm font-medium"
                        fill="#111827"
                      >
                        {node.person.nom}
                      </text>
                      <text
                        x={NODE_WIDTH / 2}
                        y="70"
                        textAnchor="middle"
                        className="text-xs"
                        fill="#4B5563"
                      >
                        {node.person.birthDate ? new Date(node.person.birthDate).getFullYear() : "?"} - 
                        {node.person.deathDate ? new Date(node.person.deathDate).getFullYear() : node.person.etat === "vivant" ? "présent" : "?"}
                      </text>
                      
                      {/* Indicateur de sexe */}
                      <circle
                        cx={NODE_WIDTH - 15}
                        cy="15"
                        r="6"
                        fill={isMale ? '#3B82F6' : isFemale ? '#EC4899' : '#8B5CF6'}
                      />
                      
                      {/* Actions rapides sur survol */}
                      <g className="opacity-0 hover:opacity-100 transition-opacity">
                        <rect
                          x={NODE_WIDTH / 2 - 40}
                          y={NODE_HEIGHT - 22}
                          width="80"
                          height="18"
                          rx="4"
                          fill="#F3F4F6"
                          className="shadow-sm"
                        />
                        <text
                          x={NODE_WIDTH / 2}
                          y={NODE_HEIGHT - 10}
                          textAnchor="middle"
                          className="text-xs"
                          fill="#4B5563"
                        >
                          Voir profil
                        </text>
                      </g>
                    </g>
                  );
                })}
                
                {/* Légende */}
                <g transform={`translate(${viewBox.x + 20}, ${viewBox.y + 20})`}>
                  <rect width="180" height="80" fill="white" opacity="0.8" rx="4" />
                  <text x="10" y="20" fill="#111827" className="text-xs font-medium">Légende:</text>
                  
                  <circle cx="15" cy="35" r="5" fill="#3B82F6" />
                  <text x="25" y="38" fill="#111827" className="text-xs">Homme</text>
                  
                  <circle cx="15" cy="50" r="5" fill="#EC4899" />
                  <text x="25" y="53" fill="#111827" className="text-xs">Femme</text>
                  
                  <circle cx="15" cy="65" r="5" fill="#8B5CF6" />
                  <text x="25" y="68" fill="#111827" className="text-xs">Autre</text>
                  
                  <line x1="100" y1="35" x2="130" y2="35" stroke="#60A5FA" strokeWidth="2" />
                  <text x="135" y="38" fill="#111827" className="text-xs">Filiation</text>
                  
                  <line x1="100" y1="50" x2="130" y2="50" stroke="#F87171" strokeWidth="2" strokeDasharray="5,5" />
                  <text x="135" y="53" fill="#111827" className="text-xs">Mariage</text>
                </g>
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  {currentFamily.persons.length === 0 
                    ? "Cet arbre généalogique est vide. Ajoutez des personnes pour commencer."
                    : "Impossible de générer l'arbre. Vérifiez les relations entre les personnes."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Détails de la personne sélectionnée */}
      {selectedPerson && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold">
              {selectedPerson.prenom} {selectedPerson.nom}
            </h2>
            <div className="flex gap-2">
              <Link
                href={`/tree?familyId=${currentFamily.id}&rootId=${selectedPerson.id}`}
                className="btn btn-primary px-4 py-2"
              >
                Centrer l'arbre sur cette personne
              </Link>
              <Link
                href={`/person/${selectedPerson.id}?familyId=${currentFamily.id}`}
                className="btn btn-secondary px-4 py-2"
              >
                Voir profil complet
              </Link>
              <button
                onClick={() => setSelectedPerson(null)}
                className="px-2 py-2 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Informations</h3>
              <ul className="space-y-2">
                <li><span className="font-medium">Sexe:</span> {selectedPerson.sexe === 'M' ? 'Homme' : selectedPerson.sexe === 'F' ? 'Femme' : 'Autre'}</li>
                <li><span className="font-medium">Naissance:</span> {selectedPerson.birthDate ? new Date(selectedPerson.birthDate).toLocaleDateString() : 'Inconnue'}</li>
                <li><span className="font-medium">Décès:</span> {selectedPerson.deathDate ? new Date(selectedPerson.deathDate).toLocaleDateString() : (selectedPerson.etat === 'vivant' ? 'Vivant' : 'Inconnu')}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Relations</h3>
              <ul className="space-y-2">
                {currentFamily.relationships
                  .filter(rel => rel.sourceId === selectedPerson.id || rel.targetId === selectedPerson.id)
                  .map(rel => {
                    const isSource = rel.sourceId === selectedPerson.id;
                    const otherId = isSource ? rel.targetId : rel.sourceId;
                    const otherPerson = currentFamily.persons.find(p => p.id === otherId);
                    
                    if (!otherPerson) return null;
                    
                    let relationLabel = "";
                    if (rel.type === 'conjoint') {
                      relationLabel = rel.sousType === 'marie' ? 'Marié(e) avec' : 'Partenaire de';
                    } else if (rel.type === 'parent' && isSource) {
                      relationLabel = rel.sousType === 'pere' ? 'Père de' : rel.sousType === 'mere' ? 'Mère de' : 'Parent de';
                    } else if (rel.type === 'parent' && !isSource) {
                      relationLabel = otherPerson.sexe === 'M' ? 'Fils de' : otherPerson.sexe === 'F' ? 'Fille de' : 'Enfant de';
                    }
                    
                    return (
                      <li key={rel.id}>
                        <span className="font-medium">{relationLabel}</span>{' '}
                        <button
                          onClick={() => {
                            const person = currentFamily.persons.find(p => p.id === otherId);
                            if (person) {
                              setSelectedPerson(person);
                              handleCenterOnPerson(otherId);
                            }
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          {otherPerson.prenom} {otherPerson.nom}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}