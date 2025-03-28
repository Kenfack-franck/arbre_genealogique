// src/app/tree/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFamily } from '@/context/FamilyContext';
import { Person } from '@/lib/models/Person';
import { Family } from '@/lib/models/Families';

export default function TreeViewPage() {
  const searchParams = useSearchParams();
  const familyIdParam = searchParams.get('familyId');
  const rootIdParam = searchParams.get('rootId');
  
  const { families, activeFamily, loading } = useFamily();
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [rootPerson, setRootPerson] = useState<Person | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 600 });
  
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [treeEdges, setTreeEdges] = useState<TreeEdge[]>([]);

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

  // Déterminer la personne racine
  useEffect(() => {
    if (currentFamily) {
      let root: Person | null = null;
      
      if (rootIdParam) {
        root = currentFamily.persons.find(p => p.id === rootIdParam) || null;
      }
      
      if (!root && currentFamily.persons.length > 0) {
        // Trouver la personne avec le plus de relations
        const personRelationsCount = currentFamily.persons.map(person => {
          const relationsCount = currentFamily.relationships.filter(
            rel => rel.sourceId === person.id || rel.targetId === person.id
          ).length;
          
          return { person, relationsCount };
        });
        
        const mostConnectedPerson = personRelationsCount.reduce((most, current) => 
          current.relationsCount > most.relationsCount ? current : most,
          { person: currentFamily.persons[0], relationsCount: 0 }
        );
        
        root = mostConnectedPerson.person;
      }
      
      setRootPerson(root);
    } else {
      setRootPerson(null);
    }
  }, [currentFamily, rootIdParam]);

  // Générer l'arbre quand la personne racine change
  useEffect(() => {
    if (currentFamily && rootPerson) {
      try {
        const { nodes, edges } = generateTreeLayout(currentFamily, rootPerson.id);
        setTreeNodes(nodes);
        setTreeEdges(edges);
        
        // Réinitialiser la vue
        setViewBox({
          x: -100,
          y: -50,
          width: 1000,
          height: 600
        });
      } catch (error) {
        console.error("Erreur lors de la génération du layout:", error);
      }
    } else {
      setTreeNodes([]);
      setTreeEdges([]);
    }
  }, [currentFamily, rootPerson]);

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

  // Fonction pour sélectionner une personne
  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(prev => prev?.id === person.id ? null : person);
  };

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
          <p className="text-gray-600 mb-6">Veuillez sélectionner un arbre généalogique pour visualiser l'arbre.</p>
          <Link href="/family" className="btn btn-primary">
            Voir mes arbres généalogiques
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/family/${currentFamily.id}`} className="text-blue-600 hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour à {currentFamily.name}
        </Link>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Arbre Généalogique - {currentFamily.name}</h1>
        
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
          
          {currentFamily.persons.length > 0 && (
            <select
              value={rootPerson?.id || ''}
              onChange={(e) => {
                const newRootId = e.target.value;
                window.location.href = `/tree?familyId=${currentFamily.id}${newRootId ? `&rootId=${newRootId}` : ''}`;
              }}
              className="form-input rounded-md px-4 py-2 border border-gray-300"
            >
              <option value="" disabled>Centrer sur une personne</option>
              {currentFamily.persons.map(person => (
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
              {/* Lignes de connexion */}
              {treeEdges.map(edge => {
                const sourceNode = treeNodes.find(n => n.id === edge.source);
                const targetNode = treeNodes.find(n => n.id === edge.target);
                
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
              {treeNodes.map(node => {
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
      
      {selectedPerson && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold">
              {selectedPerson.prenom} {selectedPerson.nom}
            </h2>
            <div className="flex gap-2">
              <Link
                href={`/tree?familyId=${currentFamily.id}&rootId=${selectedPerson.id}`}
                className="btn btn-primary px-4 py-2"
              >
                Centrer l'arbre
              </Link>
              <Link
                href={`/person/${selectedPerson.id}?familyId=${currentFamily.id}`}
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
                            if (person) setSelectedPerson(person);
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

// Types pour l'arbre
interface TreeNode {
  id: string;
  person: Person;
  x: number;
  y: number;
  level: number;
}

interface TreeEdge {
  id: string;
  source: string;
  target: string;
  type: 'parent-child' | 'spouse';
}

// Fonction simplifiée pour générer le layout de l'arbre
function generateTreeLayout(family: Family, rootId: string): { nodes: TreeNode[], edges: TreeEdge[] } {
  const nodes: TreeNode[] = [];
  const edges: TreeEdge[] = [];
  const processed = new Set<string>();
  
  // Trouver la personne racine
  const rootPerson = family.persons.find(p => p.id === rootId);
  if (!rootPerson) {
    throw new Error("Personne racine non trouvée");
  }
  
  // Ajouter la racine au centre
  nodes.push({
    id: rootPerson.id,
    person: rootPerson,
    x: 0,
    y: 0,
    level: 0
  });
  processed.add(rootPerson.id);
  
  // Ajouter les conjoints (à droite)
  const spouseRelations = family.relationships.filter(r => 
    r.type === 'conjoint' && (r.sourceId === rootId || r.targetId === rootId)
  );
  
  let spouseX = 200;
  for (const rel of spouseRelations) {
    const spouseId = rel.sourceId === rootId ? rel.targetId : rel.sourceId;
    const spouse = family.persons.find(p => p.id === spouseId);
    
    if (spouse && !processed.has(spouseId)) {
      nodes.push({
        id: spouseId,
        person: spouse,
        x: spouseX,
        y: 0,
        level: 0
      });
      
      edges.push({
        id: `edge-spouse-${rel.id}`,
        source: rootId,
        target: spouseId,
        type: 'spouse'
      });
      
      processed.add(spouseId);
      spouseX += 200;
    }
  }
  
  // Ajouter les parents (en haut)
  const parentRelations = family.relationships.filter(r => 
    r.type === 'parent' && r.targetId === rootId
  );
  
  let parentX = -200;
  for (const rel of parentRelations) {
    const parentId = rel.sourceId;
    const parent = family.persons.find(p => p.id === parentId);
    
    if (parent && !processed.has(parentId)) {
      nodes.push({
        id: parentId,
        person: parent,
        x: parentX,
        y: -150,
        level: -1
      });
      
      edges.push({
        id: `edge-parent-${rel.id}`,
        source: parentId,
        target: rootId,
        type: 'parent-child'
      });
      
      processed.add(parentId);
      parentX += 200;
    }
  }
  
  // Ajouter les enfants (en bas)
  const childRelations = family.relationships.filter(r => 
    r.type === 'parent' && r.sourceId === rootId
  );
  
  let childCount = childRelations.length;
  let childX = -(childCount * 100) + 100;
  
  for (const rel of childRelations) {
    const childId = rel.targetId;
    const child = family.persons.find(p => p.id === childId);
    
    if (child && !processed.has(childId)) {
      nodes.push({
        id: childId,
        person: child,
        x: childX,
        y: 150,
        level: 1
      });
      
      edges.push({
        id: `edge-child-${rel.id}`,
        source: rootId,
        target: childId,
        type: 'parent-child'
      });
      
      processed.add(childId);
      childX += 200;
    }
  }
  
  return { nodes, edges };
}