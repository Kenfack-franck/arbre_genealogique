import React, { useEffect } from 'react';
import { Family } from '@/lib/models/Families';
import { Person } from '@/lib/models/Person';
import { findDirectRelationships, DirectRelationshipResults } from '../utils/relationshipUtils';

interface DirectRelationshipsProps {
  person: Person;
  family: Family;
  setSearchResults: (results: DirectRelationshipResults | null) => void;
}

const DirectRelationships: React.FC<DirectRelationshipsProps> = ({
  person,
  family,
  setSearchResults
}) => {
  useEffect(() => {
    // Effectuer la recherche dès que le composant est monté ou que la personne change
    const results = findDirectRelationships(person.id, family);
    setSearchResults(results);
  }, [person.id, family, setSearchResults]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Relations directes de {person.prenom} {person.nom}</h2>
      <p className="text-gray-600 mb-4">
        Recherche de toutes les relations directes : parents, frères/sœurs, enfants, grands-parents...
      </p>
      <div className="flex items-center justify-center py-4">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
        <span className="ml-2">Recherche en cours...</span>
      </div>
    </div>
  );
};

export default DirectRelationships;