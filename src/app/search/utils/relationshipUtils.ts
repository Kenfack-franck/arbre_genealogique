import { Family } from '@/lib/models/Families';
import { Person } from '@/lib/models/Person';
import { Relationship } from '@/lib/models/Relationship';

// Fonction pour trouver les parents d'une personne
export function findParents(personId: string, family: Family): Person[] {
  const parentRelations = family.relationships.filter(
    r => r.type === 'parent' && r.targetId === personId
  );
  
  return parentRelations.map(relation => 
    family.persons.find(p => p.id === relation.sourceId)
  ).filter(Boolean) as Person[];
}

// Fonction pour trouver les enfants d'une personne
export function findChildren(personId: string, family: Family): Person[] {
  const childRelations = family.relationships.filter(
    r => r.type === 'parent' && r.sourceId === personId
  );
  
  return childRelations.map(relation => 
    family.persons.find(p => p.id === relation.targetId)
  ).filter(Boolean) as Person[];
}

// Fonction pour trouver les frères et sœurs
export function findSiblings(personId: string, family: Family): Person[] {
  const person = family.persons.find(p => p.id === personId);
  if (!person) return [];
  
  // Trouver les parents
  const parents = findParents(personId, family);
  
  // Trouver tous les enfants de ces parents
  const siblings = new Set<Person>();
  parents.forEach(parent => {
    const children = findChildren(parent.id, family);
    children.forEach(child => {
      // Ne pas inclure la personne elle-même
      if (child.id !== personId) {
        siblings.add(child);
      }
    });
  });
  
  return Array.from(siblings);
}

// Fonction pour trouver les grands-parents
export function findGrandparents(personId: string, family: Family): Person[] {
  const parents = findParents(personId, family);
  
  const grandparents = new Set<Person>();
  parents.forEach(parent => {
    const parentParents = findParents(parent.id, family);
    parentParents.forEach(gp => grandparents.add(gp));
  });
  
  return Array.from(grandparents);
}

// Fonction pour trouver les oncles et tantes
export function findUnclesAunts(personId: string, family: Family): Person[] {
  const parents = findParents(personId, family);
  
  const unclesAunts = new Set<Person>();
  parents.forEach(parent => {
    const parentSiblings = findSiblings(parent.id, family);
    parentSiblings.forEach(sibling => unclesAunts.add(sibling));
  });
  
  return Array.from(unclesAunts);
}

// Fonction pour trouver les conjoints
export function findSpouses(personId: string, family: Family): Person[] {
  const spouseRelations = family.relationships.filter(
    r => r.type === 'conjoint' && (r.sourceId === personId || r.targetId === personId)
  );
  
  return spouseRelations.map(relation => {
    const spouseId = relation.sourceId === personId ? relation.targetId : relation.sourceId;
    return family.persons.find(p => p.id === spouseId);
  }).filter(Boolean) as Person[];
}

// Fonction générique pour catégoriser les personnes par sexe
export function categorizeByGender(persons: Person[]): { males: Person[]; females: Person[] } {
  return {
    males: persons.filter(p => p.sexe === 'M'),
    females: persons.filter(p => p.sexe === 'F')
  };
}

// Types de résultats pour la recherche directe
export interface DirectRelationshipResults {
  parents: {
    father: Person | null;
    mother: Person | null;
  };
  siblings: {
    brothers: Person[];
    sisters: Person[];
  };
  children: {
    sons: Person[];
    daughters: Person[];
  };
  grandparents: {
    grandfathers: Person[];
    grandmothers: Person[];
  };
  unclesAunts: {
    uncles: Person[];
    aunts: Person[];
  };
  spouses: Person[];
}

// Fonction pour trouver toutes les relations directes
export function findDirectRelationships(personId: string, family: Family): DirectRelationshipResults {
  const parents = findParents(personId, family);
  const parentsByGender = categorizeByGender(parents);
  
  const siblings = findSiblings(personId, family);
  const siblingsByGender = categorizeByGender(siblings);
  
  const children = findChildren(personId, family);
  const childrenByGender = categorizeByGender(children);
  
  const grandparents = findGrandparents(personId, family);
  const grandparentsByGender = categorizeByGender(grandparents);
  
  const unclesAunts = findUnclesAunts(personId, family);
  const unclesAuntsByGender = categorizeByGender(unclesAunts);
  
  const spouses = findSpouses(personId, family);
  
  return {
    parents: {
      father: parentsByGender.males[0] || null,
      mother: parentsByGender.females[0] || null,
    },
    siblings: {
      brothers: siblingsByGender.males,
      sisters: siblingsByGender.females,
    },
    children: {
      sons: childrenByGender.males,
      daughters: childrenByGender.females,
    },
    grandparents: {
      grandfathers: grandparentsByGender.males,
      grandmothers: grandparentsByGender.females,
    },
    unclesAunts: {
      uncles: unclesAuntsByGender.males,
      aunts: unclesAuntsByGender.females,
    },
    spouses: spouses,
  };
}