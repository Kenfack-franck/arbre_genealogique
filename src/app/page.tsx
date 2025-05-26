// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFamily } from '@/context/FamilyContext';

export default function HomePage() {
  const { families, activeFamily, loading } = useFamily();
  const [showWelcome, setShowWelcome] = useState(true);

  // Effet pour faire disparaître le message de bienvenue après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">Chargement de votre histoire familiale...</h2>
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 border-l-blue-300 border-r-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section améliorée */}
      <section className="relative py-20 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: "url('/images.jpeg')", backgroundSize: '300px' }}></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-blue-800 leading-tight">
                Explorateur d'<span className="text-green-600">Arbre Généalogique</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-xl mx-auto md:mx-0">
                Découvrez, analysez et enrichissez votre histoire familiale à travers les générations
              </p>
              
              {activeFamily ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link href={`/tree?familyId=${activeFamily.id}`} 
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Visualiser larbre
                  </Link>

                    <Link href={`/full-tree?familyId=${activeFamily.id}`} 
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Visualiser larbre complet
                    </Link>
                  <Link href={`/person/new?familyId=${activeFamily.id}`} 
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter une personne
                  </Link>
                </div>
              ) : (
                <Link href="/family" 
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Créer mon premier arbre
                </Link>
              )}
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white rounded-full shadow-xl flex items-center justify-center">
                  <Image src="/globe.svg" alt="Family Tree Globe" width={300} height={300} className="transform animate-spin-slow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Message de bienvenue avec animation */}
      {showWelcome && activeFamily && (
        <div className="fixed top-6 right-6 bg-white p-4 rounded-lg shadow-lg border-l-4 border-green-500 max-w-sm animate-fade-in-right z-50">
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Arbre actif</h3>
              <p className="text-sm text-gray-600">Vous travaillez actuellement sur l'arbre "{activeFamily.name}"</p>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Section des fonctionnalités */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Votre espace généalogique</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Actions rapides */}
            <div className="bg-white rounded-xl shadow-xl p-8 transform transition-all hover:shadow-2xl border-t-4 border-blue-500">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Actions rapides</h2>
              </div>
              
              <ul className="space-y-4">
                <li className="transform transition-transform hover:translate-x-2">
                  <Link href="/family" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <div className="bg-blue-200 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Gérer mes arbres généalogiques</p>
                      <p className="text-sm text-gray-600">Créez et organisez vos différentes lignées familiales</p>
                    </div>
                  </Link>
                </li>
                
                {activeFamily && (
                  <>
                    <li className="transform transition-transform hover:translate-x-2">
                      <Link href={`/person/new?familyId=${activeFamily.id}`} className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <div className="bg-green-200 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Ajouter une nouvelle personne</p>
                          <p className="text-sm text-gray-600">Enrichissez votre arbre avec de nouveaux membres</p>
                        </div>
                      </Link>
                    </li>
                    
                    <li className="transform transition-transform hover:translate-x-2">
                      <Link href={`/relationship/analyzer?familyId=${activeFamily.id}`} className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <div className="bg-purple-200 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Analyser les liens de parenté</p>
                          <p className="text-sm text-gray-600">Découvrez les connexions entre les membres de votre famille</p>
                        </div>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Mes arbres généalogiques */}
            <div className="bg-white rounded-xl shadow-xl p-8 transform transition-all hover:shadow-2xl border-t-4 border-green-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Mes arbres généalogiques</h2>
                </div>
                
                <Link href="/family/new" className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Link>
              </div>
              
              {families.length > 0 ? (
                <div className="overflow-hidden">
                  <ul className="divide-y divide-gray-100 -mx-4">
                    {families.map(family => (
                      <li key={family.id} className="transform transition-all hover:bg-gray-50">
                        <Link href={`/family/${family.id}`} className="flex items-center p-4 hover:bg-gray-50">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 text-lg font-bold ${
                            activeFamily && activeFamily.id === family.id 
                              ? 'bg-green-200 text-green-800 ring-2 ring-green-500' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {family.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-semibold text-gray-800">{family.name}</h3>
                              {activeFamily && activeFamily.id === family.id && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Actif</span>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <div className="flex items-center mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                                {family.persons.length} personnes
                              </div>
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                {new Date(family.updatedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="bg-white p-3 rounded-full inline-block mb-4 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">Vous n'avez pas encore créé d'arbre généalogique.</p>
                  <Link href="/family/new" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md">
                    Créer mon premier arbre
                  </Link>
                </div>
              )}
              
              {families.length > 0 && (
                <div className="mt-6 text-right">
                  <Link href="/family" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                    Voir tous les arbres
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bannière statistiques */}
      {activeFamily && (
        <section className="py-12 px-4 md:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 text-center">
                <h3 className="text-lg font-medium mb-2">Membres de la famille</h3>
                <p className="text-4xl font-bold">{activeFamily.persons.length}</p>
              </div>
              
              <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 text-center">
                <h3 className="text-lg font-medium mb-2">Arbre actif</h3>
                <p className="text-4xl font-bold">{activeFamily.name}</p>
              </div>
              
              <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 text-center">
                <h3 className="text-lg font-medium mb-2">Dernière mise à jour</h3>
                <p className="text-4xl font-bold">{new Date(activeFamily.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Explorateur d'Arbre Généalogique</h3>
              <p className="text-gray-600">Préservez votre histoire familiale pour les générations futures</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}