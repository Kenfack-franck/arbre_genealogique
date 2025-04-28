import { Family } from '@/lib/models/Families';
import { Person } from '@/lib/models/Person';
import { Relationship } from '@/lib/models/Relationship';

// Type pour représenter un nœud dans le chemin
interface PathNode {
  personId: string;
  relationship?: Relationship;
  via?: string; // ID de la personne intermédiaire
}

// Type pour représenter un chemin complet entre deux personnes
export interface RelationshipPath {
  path: PathNode[];
  description: string;
}

// Fonction pour trouver le plus court chemin entre deux personnes (BFS)
export function findRelationshipPath(sourceId: string, targetId: string, family: Family): RelationshipPath | null {
  if (sourceId === targetId) {
    return {
      path: [{ personId: sourceId }],
      description: "Même personne"
    };
  }
  
  const visited = new Set<string>([sourceId]);
  const queue: { id: string; path: PathNode[] }[] = [{ id: sourceId, path: [{ personId: sourceId }] }];
  
  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    
    // Trouver toutes les relations de cette personne
    const relations = family.relationships.filter(
      r => r.sourceId === id || r.targetId === id
    );
    
    for (const relation of relations) {
      const nextId = relation.sourceId === id ? relation.targetId : relation.sourceId;
      
      if (!visited.has(nextId)) {
        visited.add(nextId);
        
        const newPath = [...path, { 
          personId: nextId, 
          relationship: relation,
          via: relation.type === 'parent' ? (relation.sourceId === id ? nextId : id) : undefined
        }];
        
        if (nextId === targetId) {
          // Trouver le chemin
          return {
            path: newPath,
            description: describeRelationship(newPath, family)
          };
        }
        
        queue.push({ id: nextId, path: newPath });
      }
    }
  }
  
  // Aucun chemin trouvé
  return null;
}

// Fonction pour décrire en langage naturel la relation entre deux personnes
function describeRelationship(path: PathNode[], family: Family): string {
  if (path.length <= 1) return "Même personne";
  if (path.length === 2) {
    const relation = path[1].relationship!;
    const person1 = family.persons.find(p => p.id === path[0].personId)!;
    const person2 = family.persons.find(p => p.id === path[1].personId)!;
    
    if (relation.type === 'parent') {
      if (relation.sourceId === path[0].personId) {
        return person1.sexe === 'M' ? "Père" : "Mère";
      } else {
        return person2.sexe === 'M' ? "Fils" : "Fille";
      }
    } else if (relation.type === 'conjoint') {
      return relation.sousType === 'marie' ? "Conjoint(e)" : "Partenaire";
    }
  }
  
  // Relation plus complexe - analyser le chemin
  // Frères/Sœurs (même parents)
  if (path.length === 3 && 
      path[1].relationship?.type === 'parent' && 
      path[2].relationship?.type === 'parent' &&
      path[1].relationship.targetId === path[0].personId &&
      path[2].relationship.targetId === path[path.length-1].personId &&
      path[1].relationship.sourceId === path[2].relationship.sourceId) {
    
    const sibling = family.persons.find(p => p.id === path[path.length-1].personId)!;
    return sibling.sexe === 'M' ? "Frère" : "Sœur";
  }
  
  // Grands-parents / petits-enfants
  if (path.length === 3 && 
      path[1].relationship?.type === 'parent' && 
      path[2].relationship?.type === 'parent') {
    
    if (path[1].relationship.targetId === path[0].personId && 
        path[2].relationship.targetId === path[1].personId) {
      // Grand-parent
      const grandparent = family.persons.find(p => p.id === path[path.length-1].personId)!;
      return grandparent.sexe === 'M' ? "Grand-père" : "Grand-mère";
    } else if (path[1].relationship.sourceId === path[0].personId && 
               path[2].relationship.sourceId === path[1].personId) {
      // Petit-enfant
      const grandchild = family.persons.find(p => p.id === path[path.length-1].personId)!;
      return grandchild.sexe === 'M' ? "Petit-fils" : "Petite-fille";
    }
  }
  
  // Oncles/tantes - neveux/nièces
  if (path.length === 4 && isUncleAuntPath(path)) {
    const relative = family.persons.find(p => p.id === path[path.length-1].personId)!;
    if (path[1].relationship?.targetId === path[0].personId) {
      return relative.sexe === 'M' ? "Oncle" : "Tante";
    } else {
      return relative.sexe === 'M' ? "Neveu" : "Nièce";
    }
  }
  
  // Cousins
  if (path.length === 5 && isCousinPath(path)) {
    const cousin = family.persons.find(p => p.id === path[path.length-1].personId)!;
    return cousin.sexe === 'M' ? "Cousin" : "Cousine";
  }
  
  // Relation générique si aucune correspondance spécifique n'est trouvée
  return `Relation familiale (${path.length - 1} liens)`;
}

// Fonction pour identifier un chemin oncle/tante - neveu/nièce
function isUncleAuntPath(path: PathNode[]): boolean {
  if (path.length !== 4) return false;
  
  const rel1 = path[1].relationship;
  const rel2 = path[2].relationship;
  const rel3 = path[3].relationship;
  
  if (!rel1 || !rel2 || !rel3) return false;
  
  // Schéma: personne -> parent -> frère/sœur du parent -> neveu/nièce
  // ou: personne -> frère/sœur -> enfant du frère/sœur -> oncle/tante
  
  return (
    rel1.type === 'parent' && 
    rel2.type === 'parent' && 
    rel3.type === 'parent' &&
    rel1.targetId === path[0].personId && 
    rel2.targetId !== path[1].personId && 
    rel2.sourceId === rel1.sourceId
  ) || (
    rel1.type === 'parent' && 
    rel2.type === 'parent' && 
    rel3.type === 'parent' &&
    rel1.sourceId === path[0].personId && 
    rel2.sourceId !== path[1].personId && 
    rel2.targetId === rel1.targetId
  );
}

// Fonction pour identifier un chemin de cousins
function isCousinPath(path: PathNode[]): boolean {
  if (path.length !== 5) return false;
  
  const rel1 = path[1].relationship;
  const rel2 = path[2].relationship;
  const rel3 = path[3].relationship;
  const rel4 = path[4].relationship;
  
  if (!rel1 || !rel2 || !rel3 || !rel4) return false;
  
  // Schéma: personne -> parent -> grand-parent -> parent -> cousin
  return (
    rel1.type === 'parent' && 
    rel2.type === 'parent' && 
    rel3.type === 'parent' && 
    rel4.type === 'parent' &&
    rel1.targetId === path[0].personId && 
    rel2.targetId === path[1].personId &&
    rel3.sourceId === rel2.sourceId &&
    rel4.targetId === path[4].personId
  );
}