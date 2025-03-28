// src/app/tree/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { Person } from '../../lib/models/Person';
import { TreeLayout, TreeNode } from '../../lib/algorithms/treeLayout';
import Link from 'next/link';

export default function TreeViewPage() {
  const { familyTree, loading } = useFamily();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [rootPersonId, setRootPersonId] = useState<string | null>(null);
  const [treeLayout, setTreeLayout] = useState<TreeLayout | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 600 });

  // Initialiser l'ID de personne racine
  useEffect(() => {
    if (familyTree && familyTree.persons.length > 0 && !rootPersonId) {
      setRootPersonId(familyTree.persons[0].id);
    }
  }, [familyTree, rootPersonId]);

  // Générer la disposition de l'arbre quand rootPersonId change
  useEffect(() => {
    if (familyTree && rootPersonId) {
      try {
        // Utilisation d'une version simplifiée pour l'exemple
        // Dans une implémentation complète, vous utiliseriez l'algorithme treeLayout
        const layout = generateSimpleTreeLayout(familyTree.persons, familyTree.relationships, rootPersonId);
        setTreeLayout(layout);
        
        // Réinitialiser la vue
        if (layout) {
          setViewBox({
            x: -layout.width / 4,
            y: -50,
            width: layout.width * 1.5,
            height: layout.height * 1.5
          });
        }
      } catch (error) {
        console.error("Erreur lors de la génération du layout:", error);
      }
    }
  }, [familyTree, rootPersonId]);

  // Fonction de zoom
  const handleZoom = (factor: number) => {
    setZoomLevel(prev => {
      const newZoom = prev * factor;
      // Limites de zoom
      return Math.min(Math.max(newZoom, 0.5), 3);
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
    if (dragState.isDragging) {
      const dx = (e.clientX - dragState.startX) * (viewBox.width / svgRef.current!.clientWidth);
      const dy = (e.clientY - dragState.startY) * (viewBox.height / svgRef.current!.clientHeight);
      
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

  // Fonction pour sélectionner une personne
  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
  };

  // Fonction pour centrer l'arbre sur une personne
  const handleCenterOnPerson = (personId: string) => {
    setRootPersonId(personId);
    setSelectedPerson(null);
  };

  // Fonction simplifiée de génération d'arbre (à remplacer par votre algorithme)
  function generateSimpleTreeLayout(persons: Person[], relationships: any[], rootId: string): TreeLayout {
    // Créer une carte pour un accès rapide aux personnes
    const personsMap = new Map(persons.map(p => [p.id, p]));
    
    // Trouver la personne racine
    const rootPerson = personsMap.get(rootId);
    if (!rootPerson) throw new Error("Personne racine non trouvée");
    
    // Créer un nœud pour la personne racine
    const nodes: TreeNode[] = [
      {
        id: rootPerson.id,
        person: rootPerson,
        x: 500,
        y: 100,
        level: 0,
        spouseNodes: [],
        childrenNodes: [],
        parentNodes: []
      }
    ];
    
    // Exemple simplifié: ajouter quelques nœuds enfants
    const childRelations = relationships.filter(r => 
      r.type === 'parent' && r.sourceId === rootId
    );
    
    // Positionner les enfants
    const childSpacing = 200;
    const totalWidth = childRelations.length * childSpacing;
    const startX = 500 - (totalWidth / 2) + (childSpacing / 2);
    
    childRelations.forEach((rel, index) => {
      const childPerson = personsMap.get(rel.targetId);
      if (childPerson) {
        nodes.push({
          id: childPerson.id,
          person: childPerson,
          x: startX + (index * childSpacing),
          y: 250,
          level: 1,
          spouseNodes: [],
          childrenNodes: [],
          parentNodes: []
        });
      }
    });
    
    // Ajouter des conjoints (simplifiés)
    const spouseRelations = relationships.filter(r =>
      r.type === 'conjoint' && (r.sourceId === rootId || r.targetId === rootId)
    );
    
    if (spouseRelations.length > 0) {
      const spouse = spouseRelations[0];
      const spouseId = spouse.sourceId === rootId ? spouse.targetId : spouse.sourceId;
      const spousePerson = personsMap.get(spouseId);
      
      if (spousePerson) {
        nodes.push({
          id: spousePerson.id,
          person: spousePerson,
          x: 700,
          y: 100,
          level: 0,
          spouseNodes: [],
          childrenNodes: [],
          parentNodes: []
        });
      }
    }
    
    // Ajouter des arêtes (simplifiées)
    const edges = relationships.filter(r =>
      (r.sourceId === rootId || r.targetId === rootId) &&
      nodes.some(n => n.id === r.sourceId) &&
      nodes.some(n => n.id === r.targetId)
    ).map(r => ({
      id: `edge-${r.id}`,
      source: r.sourceId,
      target: r.targetId,
      type: r.type === 'conjoint' ? 'spouse' : 'parent-child',
      relationship: r
    }));
    
    return {
      nodes,
      edges,
      width: 1000,
      height: 400
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement de l'arbre généalogique...</h2>
          <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Arbre Généalogique</h1>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleZoom(1.2)}
            className="btn btn-secondary px-4 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="btn btn-secondary px-4 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          {rootPersonId && (
            <select
              value={rootPersonId}
              onChange={(e) => handleCenterOnPerson(e.target.value)}
              className="form-input rounded-md px-4 py-2 border border-gray-300"
            >
              {familyTree?.persons.map(person => (
                <option key={person.id} value={person.id}>
                  {person.prenom} {person.nom}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 overflow-hidden">
        <div 
          className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden"
          style={{ cursor: dragState.isDragging ? 'grabbing' : 'grab' }}
        >
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
            {/* Lignes de connexion */}
            {treeLayout && treeLayout.edges.map(edge => {
              const sourceNode = treeLayout.nodes.find(n => n.id === edge.source);
              const targetNode = treeLayout.nodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              return (
                <line
                  key={edge.id}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={edge.type === 'spouse' ? '#F87171' : '#60A5FA'}
                  strokeWidth="2"
                  strokeDasharray={edge.type === 'spouse' ? "5,5" : ""}
                />
              );
            })}
            
            {/* Nœuds */}
            {treeLayout && treeLayout.nodes.map(node => {
              const isSelected = selectedPerson?.id === node.id;
              const isMale = node.person.sexe === 'M';
              const isFemale = node.person.sexe === 'F';
              
              const rectWidth = 150;
              const rectHeight = 80;
              
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x - rectWidth/2}, ${node.y - rectHeight/2})`}
                  onClick={() => handleSelectPerson(node.person)}
                  className="cursor-pointer"
                >
                  <rect
                    width={rectWidth}
                    height={rectHeight}
                    rx="8"
                    ry="8"
                    fill={isMale ? '#DBEAFE' : isFemale ? '#FCE7F3' : '#F3F4F6'}
                    stroke={isSelected ? '#2563EB' : '#9CA3AF'}
                    strokeWidth={isSelected ? "3" : "1"}
                  />
                  <text
                    x="75"
                    y="30"
                    textAnchor="middle"
                    className="text-sm font-medium"
                    fill="#111827"
                  >
                    {node.person.prenom}
                  </text>
                  <text
                    x="75"
                    y="50"
                    textAnchor="middle"
                    className="text-sm font-medium"
                    fill="#111827"
                  >
                    {node.person.nom}
                  </text>
                  <text
                    x="75"
                    y="70"
                    textAnchor="middle"
                    className="text-xs"
                    fill="#4B5563"
                  >
                    {node.person.birthDate ? new Date(node.person.birthDate).getFullYear() : "?"} - 
                    {node.person.deathDate ? new Date(node.person.deathDate).getFullYear() : node.person.etat === "vivant" ? "présent" : "?"}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      
      {selectedPerson && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold">
              {selectedPerson.prenom} {selectedPerson.nom}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleCenterOnPerson(selectedPerson.id)}
                className="btn btn-primary px-4 py-2"
              >
                Centrer l'arbre
              </button>
              <Link
                href={`/person/${selectedPerson.id}`}
                className="btn btn-secondary px-4 py-2"
              >
                Voir profil
              </Link>
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
                {familyTree?.relationships
                  .filter(rel => rel.sourceId === selectedPerson.id || rel.targetId === selectedPerson.id)
                  .map(rel => {
                    const isSource = rel.sourceId === selectedPerson.id;
                    const otherId = isSource ? rel.targetId : rel.sourceId;
                    const otherPerson = familyTree.persons.find(p => p.id === otherId);
                    
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
                          onClick={() => handleSelectPerson(otherPerson)}
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