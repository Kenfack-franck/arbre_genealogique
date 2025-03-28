
// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFamily } from '../context/FamilyContext';

export default function HomePage() {
  const { familyTree, loading } = useFamily();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement de larbre généalogique...</h2>
          <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Explorateur dArbre Généalogique</h1>
        <p className="text-xl text-gray-600 mb-6">
          Découvrez, analysez et enrichissez votre histoire familiale
        </p>
        
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Rechercher une personne..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Arbre actuel : {familyTree?.metadata.nom}</h2>
          <p className="mb-4">
            Nombre de personnes : <span className="font-medium">{familyTree?.persons.length}</span>
          </p>
          <p className="mb-6">
            Dernière mise à jour : <span className="font-medium">
              {new Date(familyTree?.metadata.dateMiseAJour || '').toLocaleDateString()}
            </span>
          </p>
          
          <div className="flex gap-4">
            <Link href="/tree" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
              Visualiser larbre
            </Link>
            <Link href="/person" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
              Gérer les personnes
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Actions rapides</h2>
          <ul className="space-y-3">
            <li>
              <Link href="/person/new" className="flex items-center text-blue-600 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Ajouter une nouvelle personne
              </Link>
            </li>
            <li>
              <Link href="/relationship/analyzer" className="flex items-center text-blue-600 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Analyser les liens de parenté
              </Link>
            </li>
            <li>
              <Link href="/import-export" className="flex items-center text-blue-600 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Importer/Exporter des données
              </Link>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Membres récents</h2>
          
          {familyTree && familyTree.persons.length > 0 ? (
            <ul className="divide-y">
              {familyTree.persons
                .slice(-5) // Afficher les 5 dernières personnes
                .map(person => (
                  <li key={person.id} className="py-3">
                    <Link href={`/person/${person.id}`} className="flex items-center hover:bg-gray-50 p-2 rounded">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        {person.prenom.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{person.prenom} {person.nom}</p>
                        <p className="text-sm text-gray-500">
                          {person.birthDate ? new Date(person.birthDate).getFullYear() : "?"} - 
                          {person.deathDate ? new Date(person.deathDate).getFullYear() : person.etat === "vivant" ? "présent" : "?"}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucune personne dans l'arbre généalogique.</p>
          )}
          
          <div className="mt-4">
            <Link href="/person" className="text-blue-600 hover:underline text-sm">
              Voir toutes les personnes →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
