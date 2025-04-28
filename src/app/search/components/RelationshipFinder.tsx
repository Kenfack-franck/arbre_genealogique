import React, { useState } from 'react';
import { Family } from '@/lib/models/Families';
import { Person } from '@/lib/models/Person';
import { findRelationshipPath, RelationshipPath } from '../utils/graphUtils';

interface RelationshipFinderProps {
  sourcePerson: Person;
  family: Family;
  setSearchResults: (results: RelationshipPath | null) => void;
}

const RelationshipFinder: React.FC<RelationshipFinderProps> = ({
  sourcePerson,
  family,
  setSearchResults
}) => {
  const [targetPersonId, setTargetPersonId] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = () => {
    if (!targetPersonId) return;
    
    setIsSearching(true);
    
    // Simuler un délai pour montrer le chargement (pourrait être retiré)
    setTimeout(() => {
      const results = findRelationshipPath(sourcePerson.id, targetPersonId, family);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Trouver la relation avec {sourcePerson.prenom} {sourcePerson.nom}
      </h2>
      
      <div className="mb-4">
        <label htmlFor="targetPerson" className="block text-sm font-medium text-gray-700 mb-1">
          Sélectionner la deuxième personne
        </label>
        <select
          id="targetPerson"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={targetPersonId}
          onChange={(e) => setTargetPersonId(e.target.value)}
        >
          <option value="">Choisir une personne</option>
          {family.persons
            .filter(p => p.id !== sourcePerson.id)
            .map(person => (
              <option key={person.id} value={person.id}>
                {person.prenom} {person.nom}
              </option>
            ))}
        </select>
      </div>
      
      <button
        onClick={handleSearch}
        disabled={!targetPersonId || isSearching}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isSearching ? 'Recherche en cours...' : 'Trouver la relation'}
      </button>
    </div>
  );
};

export default RelationshipFinder;