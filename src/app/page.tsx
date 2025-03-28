// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useFamily } from '@/context/FamilyContext';

export default function HomePage() {
  const { families, activeFamily, loading } = useFamily();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chargement de l'arbre généalogique...</h2>
          <div className="w-12 h-12 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Explorateur d'Arbre Généalogique</h1>
        <p className="text-xl text-gray-600 mb-6">
          Découvrez, analysez et enrichissez votre histoire familiale
        </p>
      </section>

      <section className="mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">
            {activeFamily ? (
              <>Arbre actuel : {activeFamily.name}</>
            ) : (
              <>Aucun arbre sélectionné</>
            )}
          </h2>
          
          {activeFamily ? (
            <>
              <p className="mb-4">
                Nombre de personnes : <span className="font-medium">{activeFamily.persons.length}</span>
              </p>
              <p className="mb-6">
                Dernière mise à jour : <span className="font-medium">
                  {new Date(activeFamily.updatedAt).toLocaleDateString()}
                </span>
              </p>
              
              <div className="flex gap-4">
                <Link href={`/tree?familyId=${activeFamily.id}`} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                  Visualiser l'arbre
                </Link>
                <Link href={`/person?familyId=${activeFamily.id}`} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
                  Gérer les personnes
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="mb-6 text-gray-600">Vous n'avez pas encore sélectionné d'arbre généalogique.</p>
              <Link href="/family" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                Voir mes arbres généalogiques
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Actions rapides</h2>
          <ul className="space-y-3">
            <li>
              <Link href="/family" className="flex items-center text-blue-600 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Gérer mes arbres généalogiques
              </Link>
            </li>
            {activeFamily && (
              <>
                <li>
                  <Link href={`/person/new?familyId=${activeFamily.id}`} className="flex items-center text-blue-600 hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter une nouvelle personne
                  </Link>
                </li>
                <li>
                  <Link href={`/relationship/analyzer?familyId=${activeFamily.id}`} className="flex items-center text-blue-600 hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Analyser les liens de parenté
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Mes arbres généalogiques</h2>
          
          {families.length > 0 ? (
            <ul className="divide-y">
              {families.map(family => (
                <li key={family.id} className="py-3">
                  <Link href={`/family/${family.id}`} className="flex items-center hover:bg-gray-50 p-2 rounded">
                    <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                      {family.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{family.name}</p>
                      <p className="text-sm text-gray-500">
                        {family.persons.length} personnes • Mis à jour le {new Date(family.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Vous n'avez pas encore créé d'arbre généalogique.</p>
          )}
          
          <div className="mt-4">
            <Link href="/family" className="text-blue-600 hover:underline text-sm">
              Voir tous les arbres →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}