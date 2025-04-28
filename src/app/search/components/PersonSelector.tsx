import React, { useState } from 'react';
import { Person } from '@/lib/models/Person';

interface PersonSelectorProps {
  persons: Person[];
  onSelectPerson: (person: Person | null) => void;
  selectedPerson: Person | null;
}

const PersonSelector: React.FC<PersonSelectorProps> = ({ 
  persons, 
  onSelectPerson,
  selectedPerson
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les personnes selon le terme de recherche
  const filteredPersons = persons.filter(person =>
    `${person.prenom} ${person.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher une personne..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {filteredPersons.map(person => (
            <li key={person.id} className="py-2">
              <button
                className={`w-full text-left px-3 py-2 rounded-md ${
                  selectedPerson?.id === person.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectPerson(person)}
              >
                <div className="font-medium">{person.prenom} {person.nom}</div>
                <div className="text-sm text-gray-500">
                  Né(e) : {person.birthDate ? new Date(person.birthDate).toLocaleDateString() : 'Inconnue'}
                  {person.etat === 'mort' && person.deathDate && 
                    ` • Décès : ${new Date(person.deathDate).toLocaleDateString()}`
                  }
                </div>
              </button>
            </li>
          ))}
          
          {filteredPersons.length === 0 && (
            <li className="py-4 text-center text-gray-500">
              Aucune personne trouvée pour "{searchTerm}"
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PersonSelector;