// src/app/family/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/context/FamilyContext';

export default function FamilyListPage() {
  const router = useRouter();
  const { families, activeFamily, loading, setActiveFamily } = useFamily();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage des familles selon le terme de recherche
  const filteredFamilies = families.filter(family => 
    family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Mes Arbres Généalogiques</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
          
          <Link 
            href="/family/new" 
            className="btn btn-primary inline-flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Créer un nouvel arbre
          </Link>
        </div>
      </div>
      
      {filteredFamilies.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFamilies.map(family => (
            <div 
              key={family.id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                activeFamily?.id === family.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{family.name}</h2>
                <p className="text-gray-600 mb-4">{family.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  {family.persons.length} {family.persons.length > 1 ? 'personnes' : 'personne'}
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Dernière mise à jour: {new Date(family.updatedAt).toLocaleDateString()}
                </div>
                
                <div className="flex space-x-3">
                  {activeFamily?.id !== family.id ? (
                    <button
                      onClick={() => setActiveFamily(family.id)}
                      className="flex-1 btn btn-secondary text-center"
                    >
                      Activer
                    </button>
                  ) : (
                    <span className="flex-1 bg-green-100 text-green-800 text-center py-2 px-4 rounded font-medium">
                      Actif
                    </span>
                  )}
                  
                  <Link
                    href={`/family/${family.id}`}
                    className="flex-1 btn btn-primary text-center"
                  >
                    Ouvrir
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Aucun arbre généalogique trouvé</h2>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? `Aucun résultat pour "${searchTerm}"`
              : "Vous n'avez pas encore créé d'arbre généalogique"}
          </p>
          <Link href="/family/new" className="btn btn-primary">
            Créer mon premier arbre
          </Link>
        </div>
      )}
      
      <div className="mt-10 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Comment démarrer?</h2>
        <ul className="space-y-4">
          <li className="flex">
            <div className="flex-shrink-0 h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">
              1
            </div>
            <div>
              <p className="font-medium">Créez un nouvel arbre généalogique</p>
              <p className="text-gray-600">Donnez un nom à votre arbre et commencez à construire votre histoire familiale.</p>
            </div>
          </li>
          <li className="flex">
            <div className="flex-shrink-0 h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">
              2
            </div>
            <div>
              <p className="font-medium">Ajoutez des membres à votre famille</p>
              <p className="text-gray-600">Créez des profils pour chaque membre de votre famille avec leurs informations personnelles.</p>
            </div>
          </li>
          <li className="flex">
            <div className="flex-shrink-0 h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">
              3
            </div>
            <div>
              <p className="font-medium">Établissez les relations familiales</p>
              <p className="text-gray-600">Reliez les membres entre eux (parents, enfants, conjoints) pour créer votre arbre.</p>
            </div>
          </li>
          <li className="flex">
            <div className="flex-shrink-0 h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">
              4
            </div>
            <div>
              <p className="font-medium">Explorez et analysez votre arbre</p>
              <p className="text-gray-600">Visualisez l'arbre complet et découvrez les relations entre les différents membres.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}