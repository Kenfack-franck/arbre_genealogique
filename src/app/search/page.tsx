'use client';

import React, { useState } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { Person } from '@/lib/models/Person';
import PersonSelector from './components/PersonSelector';
import DirectRelationships from './components/DirectRelationships';
import RelationshipFinder from './components/RelationshipFinder';
import SearchResults from './components/SearchResults';
import Link from 'next/link';

export default function SearchPage() {
  const { activeFamily, loading } = useFamily();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [searchType, setSearchType] = useState<'direct' | 'relation'>('direct');

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

  if (!activeFamily) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Aucun arbre généalogique sélectionné</h2>
          <p className="text-gray-600 mb-6">Veuillez sélectionner un arbre généalogique pour effectuer une recherche.</p>
          <Link href="/family" className="btn btn-primary">
            Voir mes arbres généalogiques
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Recherche Généalogique</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Sélection de la personne</h2>
            <PersonSelector 
              persons={activeFamily.persons}
              onSelectPerson={setSelectedPerson}
              selectedPerson={selectedPerson}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Type de recherche</h2>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="direct"
                  checked={searchType === 'direct'}
                  onChange={() => setSearchType('direct')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Relations directes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="relation"
                  checked={searchType === 'relation'}
                  onChange={() => setSearchType('relation')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2">Trouver la relation exacte</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-8">
          {selectedPerson ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              {searchType === 'direct' ? (
                <DirectRelationships 
                  person={selectedPerson}
                  family={activeFamily}
                  setSearchResults={setSearchResults}
                />
              ) : (
                <RelationshipFinder 
                  sourcePerson={selectedPerson}
                  family={activeFamily}
                  setSearchResults={setSearchResults}
                />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">Veuillez sélectionner une personne pour commencer la recherche.</p>
            </div>
          )}
          
          {searchResults && (
            <div className="mt-6">
              <SearchResults results={searchResults} family={activeFamily} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}