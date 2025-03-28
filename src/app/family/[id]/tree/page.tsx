// src/app/family/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFamily } from '@/context/FamilyContext';
import { Family } from '@/lib/models/Families';
import { Person } from '@/lib/models/Person';
import { calculateAge } from '@/lib/utils/dateUtils';

export default function FamilyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { families, loading, deleteFamily } = useFamily();
  const [family, setFamily] = useState<Family | null>(null);
  const [rootPerson, setRootPerson] = useState<Person | null>(null);
  const [stats, setStats] = useState({
    totalPersons: 0,
    maleCount: 0,
    femaleCount: 0,
    otherCount: 0,
    livingCount: 0,
    deceasedCount: 0,
    oldestPerson: null as Person | null,
    youngestPerson: null as Person | null,
    averageAge: 0
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les données de la famille
  useEffect(() => {
    if (!loading && families.length > 0 && params.id) {
      const foundFamily = families.find(f => f.id === params.id);
      
      if (foundFamily) {
        setFamily(foundFamily);
        
        // Calcul des statistiques
        const persons = foundFamily.persons;
        
        // Compter les personnes par sexe et état
        const maleCount = persons.filter(p => p.sexe === 'M').length;
        const femaleCount = persons.filter(p => p.sexe === 'F').length;
        const otherCount = persons.filter(p => p.sexe === 'A').length;
        const livingCount = persons.filter(p => p.etat === 'vivant').length;
        const deceasedCount = persons.filter(p => p.etat === 'mort').length;
        
        // Trouver la personne la plus âgée et la plus jeune
        const personsWithBirthDate = persons.filter(p => p.birthDate);
        
        let oldestPerson = null;
        let youngestPerson = null;
        
        if (personsWithBirthDate.length > 0) {
          oldestPerson = personsWithBirthDate.reduce((oldest, current) => {
            if (!oldest.birthDate) return current;
            if (!current.birthDate) return oldest;
            
            return new Date(oldest.birthDate) < new Date(current.birthDate) ? oldest : current;
          });
          
          youngestPerson = personsWithBirthDate.reduce((youngest, current) => {
            if (!youngest.birthDate) return current;
            if (!current.birthDate) return youngest;
            
            return new Date(youngest.birthDate) > new Date(current.birthDate) ? youngest : current;
          });
        }
        
        // Calculer l'âge moyen
        let totalAge = 0;
        let countWithAge = 0;
        
        for (const person of personsWithBirthDate) {
          if (person.birthDate) {
            const birthDate = new Date(person.birthDate);
            const endDate = person.etat === 'mort' && person.deathDate 
              ? new Date(person.deathDate) 
              : new Date();
            
            const ageMs = endDate.getTime() - birthDate.getTime();
            const ageDate = new Date(ageMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            
            totalAge += age;
            countWithAge++;
          }
        }
        
        const averageAge = countWithAge > 0 ? Math.round(totalAge / countWithAge) : 0;
        
        // Déterminer la personne racine (celle avec le plus de relations)
        if (persons.length > 0) {
          const personRelationsCount = persons.map(person => {
            const relationsCount = foundFamily.relationships.filter(
              rel => rel.sourceId === person.id || rel.targetId === person.id
            ).length;
            
            return { person, relationsCount };
          });
          
          const mostConnectedPerson = personRelationsCount.reduce((most, current) => 
            current.relationsCount > most.relationsCount ? current : most,
            { person: persons[0], relationsCount: 0 }
          );
          
          setRootPerson(mostConnectedPerson.person);
        }
        
        // Mettre à jour les statistiques
        setStats({
          totalPersons: persons.length,
          maleCount,
          femaleCount,
          otherCount,
          livingCount,
          deceasedCount,
          oldestPerson,
          youngestPerson,
          averageAge
        });
      } else {
        // Famille non trouvée, rediriger
        router.push('/family');
      }
    }
  }, [families, loading, params.id, router]);

  // Gestionnaire de suppression
  const handleDelete = async () => {
    if (!family) return;
    
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'arbre "${family.name}" ? Cette action est irréversible et supprimera toutes les personnes et relations associées.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deleteFamily(family.id);
      router.push('/family');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setIsDeleting(false);
    }
  };

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

  if (!family) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Arbre généalogique non trouvé</h2>
          <p className="mb-6">L'arbre généalogique que vous recherchez n'existe pas.</p>
          <Link href="/family" className="btn btn-primary">
            Retour à la liste des arbres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/family" className="text-blue-600 hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour à la liste des arbres
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {family.name}
          </h1>
          <p className="text-gray-600">
            Dernière mise à jour: {new Date(family.updatedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Link 
            href={`/family/${params.id}/edit`} 
            className="btn btn-primary inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Modifier
          </Link>
          
          <Link 
            href={`/tree?familyId=${params.id}`} 
            className="btn btn-secondary inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            Voir l'arbre complet
          </Link>
          
          <button
            onClick={handleDelete}
            className="btn btn-danger inline-flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Suppression...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Supprimer
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Statistiques</h2>
          
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nombre total de personnes</dt>
              <dd className="mt-1 text-2xl text-gray-900">{stats.totalPersons}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Répartition par sexe</dt>
              <dd className="mt-1">
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                    Hommes: {stats.maleCount}
                  </span>
                  <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2 py-1 rounded">
                    Femmes: {stats.femaleCount}
                  </span>
                  {stats.otherCount > 0 && (
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                      Autre: {stats.otherCount}
                    </span>
                  )}
                </div>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Vivants / Décédés</dt>
              <dd className="mt-1">
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Vivants: {stats.livingCount}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                    Décédés: {stats.deceasedCount}
                  </span>
                </div>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Âge moyen</dt>
              <dd className="mt-1 text-gray-900">{stats.averageAge} ans</dd>
            </div>
            
            {stats.oldestPerson && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Personne la plus âgée</dt>
                <dd className="mt-1">
                  <Link href={`/person/${stats.oldestPerson.id}?familyId=${family.id}`} className="text-blue-600 hover:underline">
                    {stats.oldestPerson.prenom} {stats.oldestPerson.nom}
                  </Link>
                  {stats.oldestPerson.birthDate && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({calculateAge(stats.oldestPerson)} ans)
                    </span>
                  )}
                </dd>
              </div>
            )}
            
            {stats.youngestPerson && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Personne la plus jeune</dt>
                <dd className="mt-1">
                  <Link href={`/person/${stats.youngestPerson.id}?familyId=${family.id}`} className="text-blue-600 hover:underline">
                    {stats.youngestPerson.prenom} {stats.youngestPerson.nom}
                  </Link>
                  {stats.youngestPerson.birthDate && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({calculateAge(stats.youngestPerson)} ans)
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
        
        {/* Membres récents */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Membres récents</h2>
          
          {family.persons.length > 0 ? (
            <ul className="divide-y">
              {family.persons
                .slice(-5) // Afficher les 5 dernières personnes
                .map(person => (
                  <li key={person.id} className="py-3">
                    <Link href={`/person/${person.id}?familyId=${family.id}`} className="flex items-center hover:bg-gray-50 p-2 rounded">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        person.sexe === 'M' ? 'bg-blue-100 text-blue-800' : 
                        person.sexe === 'F' ? 'bg-pink-100 text-pink-800' : 
                        'bg-purple-100 text-purple-800'
                      }`}>
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
            <p className="text-gray-500 italic">Aucune personne dans cet arbre généalogique.</p>
          )}
          
          <div className="mt-6 flex justify-between items-center">
            <Link href={`/person?familyId=${family.id}`} className="text-blue-600 hover:underline text-sm">
              Voir toutes les personnes →
            </Link>
            
            <Link href={`/person/new?familyId=${family.id}`} className="btn btn-primary">
              Ajouter une personne
            </Link>
          </div>
        </div>
      </div>
      
      {/* Suggestions et actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Racine de l'arbre</h2>
          
          {rootPerson ? (
            <div>
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  rootPerson.sexe === 'M' ? 'bg-blue-100 text-blue-800' : 
                  rootPerson.sexe === 'F' ? 'bg-pink-100 text-pink-800' : 
                  'bg-purple-100 text-purple-800'
                }`}>
                  {rootPerson.prenom.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{rootPerson.prenom} {rootPerson.nom}</p>
                  <p className="text-sm text-gray-500">
                    Personne centrale de l'arbre
                  </p>
                </div>
              </div>
              
              <p className="mb-4 text-gray-600">
                Cette personne est actuellement utilisée comme point de départ pour visualiser l'arbre généalogique.
              </p>
              
              <div className="flex gap-3">
                <Link 
                  href={`/person/${rootPerson.id}?familyId=${family.id}`} 
                  className="btn btn-secondary inline-block"
                >
                  Voir le profil
                </Link>
                <Link 
                  href={`/tree?familyId=${family.id}&rootId=${rootPerson.id}`} 
                  className="btn btn-primary inline-block"
                >
                  Voir l'arbre centré
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">Aucune personne racine définie.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Actions rapides</h2>
          
          <ul className="space-y-3">
            <li>
              <Link href={`/person/new?familyId=${family.id}`} className="flex items-center text-blue-600 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Ajouter une nouvelle personne
              </Link>
            </li>
            <li>
              <Link href={`/relationship/new?familyId=${family.id}`} className="flex items-center text-blue-600 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Ajouter une relation
              </Link>
            </li>
            <li>
              <Link href={`/relationship/analyzer?familyId=${family.id}`} className="flex items-center text-blue-600 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
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
      </div>
    </div>
  );
}