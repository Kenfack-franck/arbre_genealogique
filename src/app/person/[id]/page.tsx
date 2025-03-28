// src/app/person/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFamily } from '@/context/FamilyContext';
import { Person } from '@/lib/models/Person';
import { Relationship } from '@/lib/models/Relationship';
import { Family } from '@/lib/models/Families';
import { calculateAge } from '@/lib/utils/dateUtils';

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const familyIdParam = searchParams.get('familyId');
  
  const { families, activeFamily, loading } = useFamily();
  
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [relations, setRelations] = useState<{ 
    parents: {person: Person, relation: Relationship}[],
    children: {person: Person, relation: Relationship}[],
    spouses: {person: Person, relation: Relationship}[]
  }>({
    parents: [],
    children: [],
    spouses: []
  });

  // Déterminer la famille actuelle
  useEffect(() => {
    if (!loading && families.length > 0) {
      let family: Family | null = null;
      
      if (familyIdParam) {
        family = families.find(f => f.id === familyIdParam) || null;
      } else if (activeFamily) {
        family = activeFamily;
      }
      
      setCurrentFamily(family);
    }
  }, [loading, families, activeFamily, familyIdParam]);

  // Charger les détails de la personne
  useEffect(() => {
    if (currentFamily && params.id) {
      const personId = params.id as string;
      const foundPerson = currentFamily.persons.find(p => p.id === personId);
      
      if (foundPerson) {
        setPerson(foundPerson);
        
        // Trouver les relations
        const personParents: {person: Person, relation: Relationship}[] = [];
        const personChildren: {person: Person, relation: Relationship}[] = [];
        const personSpouses: {person: Person, relation: Relationship}[] = [];
        
        currentFamily.relationships.forEach(rel => {
          const isSource = rel.sourceId === personId;
          const isTarget = rel.targetId === personId;
          
          if (!isSource && !isTarget) return;
          
          const otherId = isSource ? rel.targetId : rel.sourceId;
          const otherPerson = currentFamily.persons.find(p => p.id === otherId);
          
          if (!otherPerson) return;
          
          if (rel.type === 'parent') {
            if (isSource) {
              // Cette personne est parent de quelqu'un
              personChildren.push({ person: otherPerson, relation: rel });
            } else {
              // Cette personne est l'enfant de quelqu'un
              personParents.push({ person: otherPerson, relation: rel });
            }
          } else if (rel.type === 'conjoint') {
            personSpouses.push({ person: otherPerson, relation: rel });
          }
        });
        
        setRelations({
          parents: personParents,
          children: personChildren,
          spouses: personSpouses
        });
      } else if (currentFamily) {
        // Personne non trouvée, rediriger
        router.push(`/person?familyId=${currentFamily.id}`);
      }
    }
  }, [currentFamily, params.id, router]);

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

  if (!currentFamily) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Aucun arbre généalogique sélectionné</h2>
          <p className="mb-6">Veuillez sélectionner un arbre généalogique pour voir les détails d'une personne.</p>
          <Link href="/family" className="btn btn-primary">
            Voir mes arbres généalogiques
          </Link>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Personne non trouvée</h2>
          <p className="mb-6">La personne que vous recherchez n'existe pas dans cet arbre généalogique.</p>
          <Link href={`/person?familyId=${currentFamily.id}`} className="btn btn-primary">
            Retour à la liste des personnes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/person?familyId=${currentFamily.id}`} className="text-blue-600 hover:underline inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour à la liste
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {person.prenom} {person.nom}
          </h1>
          <p className="text-gray-600">
            {person.birthDate && new Date(person.birthDate).toLocaleDateString()} - 
            {person.deathDate ? new Date(person.deathDate).toLocaleDateString() : person.etat === "vivant" ? "présent" : "?"}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Link 
            href={`/person/${person.id}/edit?familyId=${currentFamily.id}`} 
            className="btn btn-primary inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Modifier
          </Link>
          
          <Link 
            href={`/tree?familyId=${currentFamily.id}&rootId=${person.id}`} 
            className="btn btn-secondary inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            Voir dans l'arbre
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Informations personnelles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Informations personnelles</h2>
          
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
              <dd className="mt-1 text-gray-900">{person.prenom} {person.nom}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Sexe</dt>
              <dd className="mt-1 text-gray-900">
                {person.sexe === 'M' ? 'Homme' : person.sexe === 'F' ? 'Femme' : 'Autre'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
              <dd className="mt-1 text-gray-900">
                {person.birthDate ? new Date(person.birthDate).toLocaleDateString() : 'Inconnue'}
              </dd>
            </div>
            
            {person.deathDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Date de décès</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(person.deathDate).toLocaleDateString()}
                </dd>
              </div>
            )}
            
            <div>
              <dt className="text-sm font-medium text-gray-500">État</dt>
              <dd className="mt-1">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  person.etat === 'vivant' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {person.etat === 'vivant' ? 'Vivant' : 'Décédé'}
                </span>
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Âge</dt>
              <dd className="mt-1 text-gray-900">
                {calculateAge(person)}
              </dd>
            </div>
          </dl>
        </div>
        
        {/* Relations familiales */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Relations familiales</h2>
          
          <div className="space-y-6">
            {/* Parents */}
            <div>
              <h3 className="text-lg font-medium mb-3">Parents</h3>
              {relations.parents.length > 0 ? (
                <ul className="space-y-2">
                  {relations.parents.map(({ person: parent, relation }) => (
                    <li key={parent.id} className="flex items-center">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">
                        {relation.sousType === 'pere' ? 'Père' : relation.sousType === 'mere' ? 'Mère' : 'Parent'}
                      </span>
                      <Link 
                        href={`/person/${parent.id}?familyId=${currentFamily.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {parent.prenom} {parent.nom}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Aucun parent enregistré</p>
              )}
            </div>
            
            {/* Conjoints */}
            <div>
              <h3 className="text-lg font-medium mb-3">Conjoints</h3>
              {relations.spouses.length > 0 ? (
                <ul className="space-y-2">
                  {relations.spouses.map(({ person: spouse, relation }) => (
                    <li key={spouse.id} className="flex items-center">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded mr-2">
                        {relation.sousType === 'marie' ? 'Marié(e)' : 'Partenaire'}
                      </span>
                      <Link 
                        href={`/person/${spouse.id}?familyId=${currentFamily.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {spouse.prenom} {spouse.nom}
                      </Link>
                      {relation.dateDebut && (
                        <span className="text-sm text-gray-500 ml-2">
                          depuis {new Date(relation.dateDebut).toLocaleDateString()}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Aucun conjoint enregistré</p>
              )}
            </div>
            
            {/* Enfants */}
            <div>
              <h3 className="text-lg font-medium mb-3">Enfants</h3>
              {relations.children.length > 0 ? (
                <ul className="space-y-2">
                  {relations.children.map(({ person: child, relation }) => (
                    <li key={child.id} className="flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2">
                        {relation.sousType === 'adopte' ? 'Adopté(e)' : 'Biologique'}
                      </span>
                      <Link 
                        href={`/person/${child.id}?familyId=${currentFamily.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {child.prenom} {child.nom}
                      </Link>
                      <span className="text-sm text-gray-500 ml-2">
                        ({child.birthDate ? new Date(child.birthDate).getFullYear() : '?'})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Aucun enfant enregistré</p>
              )}
            </div>
            
            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-3">Ajouter une relation</h3>
              <div className="flex flex-wrap gap-3">
                <Link 
                  href={`/relationship/new?type=parent&targetId=${person.id}&familyId=${currentFamily.id}`}
                  className="btn btn-secondary text-sm"
                >
                  Ajouter un parent
                </Link>
                <Link 
                  href={`/relationship/new?type=conjoint&sourceId=${person.id}&familyId=${currentFamily.id}`}
                  className="btn btn-secondary text-sm"
                >
                  Ajouter un conjoint
                </Link>
                <Link 
                  href={`/relationship/new?type=parent&sourceId=${person.id}&familyId=${currentFamily.id}`}
                  className="btn btn-secondary text-sm"
                >
                  Ajouter un enfant
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analyse de relations */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Analyse de relations</h2>
        
        <p className="mb-4">
          Sélectionnez une autre personne pour analyser la relation avec {person.prenom} {person.nom}
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="form-input rounded-md px-4 py-2 border border-gray-300 flex-grow"
            onChange={(e) => {
              if (e.target.value) {
                router.push(`/relationship/analyzer?person1=${person.id}&person2=${e.target.value}&familyId=${currentFamily.id}`);
              }
            }}
          >
            <option value="">Sélectionner une personne</option>
            {currentFamily.persons
              .filter(p => p.id !== person.id)
              .map(p => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
              ))}
          </select>
          
          <button
            className="btn btn-primary"
            onClick={() => router.push(`/relationship/analyzer?person1=${person.id}&familyId=${currentFamily.id}`)}
          >
            Analyser les relations
          </button>
        </div>
      </div>
    </div>
  );
}