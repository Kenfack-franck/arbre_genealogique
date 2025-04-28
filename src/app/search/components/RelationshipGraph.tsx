import React, { useEffect, useRef } from 'react';
import { Family } from '@/lib/models/Families';
import { Person } from '@/lib/models/Person';
import { DirectRelationshipResults } from '../utils/relationshipUtils';
import { RelationshipPath } from '../utils/graphUtils';

interface RelationshipGraphProps {
  family: Family;
  focusPerson: Person;
  relationshipData?: DirectRelationshipResults | RelationshipPath;
}

const RelationshipGraph: React.FC<RelationshipGraphProps> = ({
  family,
  focusPerson,
  relationshipData
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !relationshipData) return;
    
    // Ici, on pourrait implémenter une visualisation graphique
    // en utilisant D3.js ou une approche plus simple
    
    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    
    // Effacer le contenu précédent
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // Dessiner le graphe simplifié
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Créer un nœud central pour la personne principale
    createNode(svg, centerX, centerY, focusPerson.prenom, '#4F46E5');
    
    // Si c'est un résultat de relation directe
    if ('parents' in relationshipData) {
      const direct = relationshipData as DirectRelationshipResults;
      
      // Positionner les parents en haut
      if (direct.parents.father) {
        createNode(svg, centerX - 120, centerY - 100, direct.parents.father.prenom, '#3B82F6');
        createLink(svg, centerX - 120, centerY - 100, centerX, centerY, '#3B82F6');
      }
      
      if (direct.parents.mother) {
        createNode(svg, centerX + 120, centerY - 100, direct.parents.mother.prenom, '#EC4899');
        createLink(svg, centerX + 120, centerY - 100, centerX, centerY, '#EC4899');
      }
      
      // Positionner les frères et sœurs à gauche
      const siblings = [...direct.siblings.brothers, ...direct.siblings.sisters];
      siblings.slice(0, 3).forEach((sibling, index) => {
        createNode(svg, centerX - 150, centerY - 40 + index * 60, sibling.prenom, '#8B5CF6');
        createLink(svg, centerX - 150, centerY - 40 + index * 60, centerX, centerY, '#8B5CF6');
      });
      
      // Positionner les enfants en bas
      const children = [...direct.children.sons, ...direct.children.daughters];
      children.slice(0, 3).forEach((child, index) => {
        createNode(svg, centerX - 100 + index * 100, centerY + 100, child.prenom, '#10B981');
        createLink(svg, centerX - 100 + index * 100, centerY + 100, centerX, centerY, '#10B981');
      });
      
      // Positionner les conjoints à droite
      direct.spouses.slice(0, 2).forEach((spouse, index) => {
        createNode(svg, centerX + 150, centerY - 40 + index * 60, spouse.prenom, '#F59E0B');
        createLink(svg, centerX + 150, centerY - 40 + index * 60, centerX, centerY, '#F59E0B');
      });
    } 
    // Si c'est un résultat de recherche de chemin
    else if ('path' in relationshipData) {
      const path = relationshipData as RelationshipPath;
      
      // Dessiner le chemin linéaire
      const pathLength = path.path.length;
      if (pathLength > 1) {
        const stepX = width / (pathLength);
        
        path.path.forEach((node, index) => {
          const person = family.persons.find(p => p.id === node.personId);
          if (!person) return;
          
          const x = 50 + index * stepX;
          const y = height / 2;
          
          createNode(svg, x, y, person.prenom, index === 0 || index === pathLength - 1 ? '#4F46E5' : '#6B7280');
          
          if (index > 0) {
            createLink(svg, x - stepX, y, x, y, '#6B7280');
          }
        });
      }
    }
    
  }, [family, focusPerson, relationshipData]);
  
  // Fonction utilitaire pour créer un nœud (cercle avec texte)
  const createNode = (
    svg: SVGSVGElement, 
    x: number, 
    y: number, 
    label: string, 
    color: string
  ) => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', y.toString());
    circle.setAttribute('r', '30');
    circle.setAttribute('fill', color);
    group.appendChild(circle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toString());
    text.setAttribute('y', y.toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '12');
    text.textContent = label;
    group.appendChild(text);
    
    svg.appendChild(group);
  };
  
  // Fonction utilitaire pour créer un lien entre deux nœuds
  const createLink = (
    svg: SVGSVGElement, 
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number, 
    color: string
  ) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '2');
    
    svg.appendChild(line);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Visualisation des relations</h2>
      <svg 
        ref={svgRef} 
        className="w-full h-96 border rounded-lg"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
      />
      <p className="text-center text-sm text-gray-500 mt-2">
        Visualisation simplifiée des relations familiales
      </p>
    </div>
  );
};

export default RelationshipGraph;   