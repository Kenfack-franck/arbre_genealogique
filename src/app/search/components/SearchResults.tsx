import React from 'react';
import Link from 'next/link';
import { Family } from '@/lib/models/Families';
import { Person } from '@/lib/models/Person';
import { DirectRelationshipResults } from '../utils/relationshipUtils';
import { RelationshipPath } from '../utils/graphUtils';
import { PathNode } from '../../search/utils/graphUtils';


interface SearchResultsProps {
  results: DirectRelationshipResults | RelationshipPath;
  family: Family;
}


// Ajoutez ce composant qui était présent dans la version originale
// Composant pour afficher les résultats de relations directes
const DirectRelationshipResults: React.FC<{ 
    results: DirectRelationshipResults; 
    family: Family;
  }> = ({ results, family }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Résultats de la recherche</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parents */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">Parents</h3>
            {(!results.parents.father && !results.parents.mother) ? (
              <p className="text-gray-500">Aucun parent trouvé</p>
            ) : (
              <ul className="space-y-2">
                {results.parents.father && (
                  <li className="flex items-center">
                    <span className="text-blue-600 mr-2">Père:</span>
                    <PersonLink person={results.parents.father} family={family} />
                  </li>
                )}
                {results.parents.mother && (
                  <li className="flex items-center">
                    <span className="text-pink-600 mr-2">Mère:</span>
                    <PersonLink person={results.parents.mother} family={family} />
                  </li>
                )}
              </ul>
            )}
          </div>
          
          {/* Frères et sœurs */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">Frères et sœurs</h3>
            {(results.siblings.brothers.length === 0 && results.siblings.sisters.length === 0) ? (
              <p className="text-gray-500">Aucun frère ou sœur trouvé</p>
            ) : (
              <>
                {results.siblings.brothers.length > 0 && (
                  <div className="mb-2">
                    <h4 className="font-medium">Frères ({results.siblings.brothers.length})</h4>
                    <ul className="list-disc list-inside ml-2">
                      {results.siblings.brothers.map(brother => (
                        <li key={brother.id}>
                          <PersonLink person={brother} family={family} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {results.siblings.sisters.length > 0 && (
                  <div>
                    <h4 className="font-medium">Sœurs ({results.siblings.sisters.length})</h4>
                    <ul className="list-disc list-inside ml-2">
                      {results.siblings.sisters.map(sister => (
                        <li key={sister.id}>
                          <PersonLink person={sister} family={family} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Enfants */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">Enfants</h3>
            {(results.children.sons.length === 0 && results.children.daughters.length === 0) ? (
              <p className="text-gray-500">Aucun enfant trouvé</p>
            ) : (
              <>
                {results.children.sons.length > 0 && (
                  <div className="mb-2">
                    <h4 className="font-medium">Fils ({results.children.sons.length})</h4>
                    <ul className="list-disc list-inside ml-2">
                      {results.children.sons.map(son => (
                        <li key={son.id}>
                          <PersonLink person={son} family={family} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {results.children.daughters.length > 0 && (
                  <div>
                    <h4 className="font-medium">Filles ({results.children.daughters.length})</h4>
                    <ul className="list-disc list-inside ml-2">
                      {results.children.daughters.map(daughter => (
                        <li key={daughter.id}>
                          <PersonLink person={daughter} family={family} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Grands-parents */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">Grands-parents</h3>
            {(results.grandparents.grandfathers.length === 0 && results.grandparents.grandmothers.length === 0) ? (
              <p className="text-gray-500">Aucun grand-parent trouvé</p>
            ) : (
              <>
                {results.grandparents.grandfathers.length > 0 && (
                  <div className="mb-2">
                    <h4 className="font-medium">Grands-pères ({results.grandparents.grandfathers.length})</h4>
                    <ul className="list-disc list-inside ml-2">
                      {results.grandparents.grandfathers.map(grandfather => (
                        <li key={grandfather.id}>
                          <PersonLink person={grandfather} family={family} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {results.grandparents.grandmothers.length > 0 && (
                  <div>
                    <h4 className="font-medium">Grands-mères ({results.grandparents.grandmothers.length})</h4>
                    <ul className="list-disc list-inside ml-2">
                      {results.grandparents.grandmothers.map(grandmother => (
                        <li key={grandmother.id}>
                          <PersonLink person={grandmother} family={family} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Oncles et tantes */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">Oncles et tantes</h3>
            {(results.unclesAunts.uncles.length === 0 && results.unclesAunts.aunts.length === 0) ? (
              <p className="text-gray-500">Aucun oncle ou tante trouvé</p>
            ) : (
              <>
                {results.unclesAunts.uncles.length > 0 && (
                  <div className="mb-2">
                    <h4 className="font-medium">Oncles ({results.unclesAunts.uncles.length})</h4>
                    <ul className="list-disc list-inside ml-2">
                      {results.unclesAunts.uncles.map(uncle => (
                        <li key={uncle.id}>
                          <PersonLink person={uncle} family={family} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {results.unclesAunts.aunts.length > 0 && (
                  <div>
                    <h4 className="font-medium">Tantes ({results.unclesAunts.aunts.length})</h4>
                    <ul className="list-disc list-inside ml-2">
                      {results.unclesAunts.aunts.map(aunt => (
                        <li key={aunt.id}>
                          <PersonLink person={aunt} family={family} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Conjoints */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-lg mb-2">Conjoints</h3>
            {results.spouses.length === 0 ? (
              <p className="text-gray-500">Aucun conjoint trouvé</p>
            ) : (
              <ul className="list-disc list-inside ml-2">
                {results.spouses.map(spouse => (
                  <li key={spouse.id}>
                    <PersonLink person={spouse} family={family} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Composant utilitaire pour créer un lien vers une personne
  const PersonLink: React.FC<{
    person: Person;
    family: Family;
  }> = ({ person, family }) => {
    return (
      <Link 
        href={`/person/${person.id}?family=${family.id}`}
        className="text-blue-600 hover:underline"
      >
        {person.prenom} {person.nom}
        <span className="text-gray-500 text-sm ml-1">
          ({person.birthDate ? new Date(person.birthDate).getFullYear() : '?'})
        </span>
      </Link>
    );
  };



const SearchResults: React.FC<SearchResultsProps> = ({ results, family }) => {
  // Vérifier si c'est un résultat de relation directe
  const isDirectRelationship = 'parents' in results;
  
  if (isDirectRelationship) {
    const directResults = results as DirectRelationshipResults;
    return <DirectRelationshipResults results={directResults} family={family} />;
  } else {
    const pathResults = results as RelationshipPath;
    return <RelationshipPathResults results={pathResults} family={family} />;
  }
};

// Version améliorée du composant pour afficher les résultats de relation entre deux personnes
const RelationshipPathResults: React.FC<{
    results: RelationshipPath;
    family: Family;
  }> = ({ results, family }) => {
    // Trouver les personnes impliquées dans le chemin
    const startPerson = family.persons.find(p => p.id === results.path[0].personId);
    const endPerson = family.persons.find(p => p.id === results.path[results.path.length - 1].personId);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Relation trouvée</h2>
        
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-center mb-2">
            <div className="text-xl">
              {startPerson && (
                <span className="font-semibold">{startPerson.prenom} {startPerson.nom}</span>
              )}
              <span className="mx-2">est</span>
              <span className="font-semibold text-blue-600">{results.description}</span>
              <span className="mx-2">de</span>
              {endPerson && (
                <span className="font-semibold">{endPerson.prenom} {endPerson.nom}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-lg mb-3">Explication de la relation</h3>
          
          {/* Version graphique simplifiée (sous forme d'arbre horizontal) */}
          <div className="flex justify-center items-center mb-6 overflow-x-auto py-4">
            {results.path.map((node, index) => {
              const person = family.persons.find(p => p.id === node.personId);
              if (!person) return null;
              
              // Détermine le texte explicatif de la relation
              let relationText = "";
              if (index > 0 && node.relationship) {
                const rel = node.relationship;
                if (rel.type === "parent" && rel.sourceId === node.personId) {
                  relationText = person.sexe === "M" ? "est le père de" : "est la mère de";
                } else if (rel.type === "parent" && rel.targetId === node.personId) {
                  relationText = person.sexe === "M" ? "est le fils de" : "est la fille de";
                } else if (rel.type === "conjoint") {
                  relationText = rel.sousType === "marie" ? 
                    "est marié(e) à" : "est en couple avec";
                }
              }
              
              return (
                <React.Fragment key={index}>
                  {/* Nœud de personne */}
                  <div className="flex flex-col items-center min-w-max">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? "bg-blue-600" : 
                      index === results.path.length - 1 ? "bg-green-600" : "bg-gray-600"
                    }`}>
                      {person.prenom.charAt(0)}{person.nom.charAt(0)}
                    </div>
                    <div className="mt-2 text-center">
                      <div className="font-medium">{person.prenom} {person.nom}</div>
                      <div className="text-xs text-gray-500">
                        {person.birthDate ? new Date(person.birthDate).getFullYear() : '?'}
                        {person.etat === 'mort' && person.deathDate && 
                          ` - ${new Date(person.deathDate).getFullYear()}`
                        }
                      </div>
                    </div>
                  </div>
                  
                  {/* Flèche et texte explicatif entre les personnes */}
                  {index < results.path.length - 1 && (
                    <div className="mx-2 flex flex-col items-center justify-center">
                      <div className="text-center text-sm text-gray-600 mb-1 min-w-max px-2">
                        {relationText}
                      </div>
                      <div className="text-gray-400 text-2xl">→</div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          
          {/* Version textuelle en langage naturel */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Explication en langage naturel:</h4>
            <p className="text-gray-700">
              {buildNaturalLanguageExplanation(results.path, family)}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // Fonction pour créer une explication en langage naturel de la relation
  function buildNaturalLanguageExplanation(path: PathNode[], family: Family): string {
    if (path.length <= 1) return "Il s'agit de la même personne.";
    
    const startPerson = family.persons.find(p => p.id === path[0].personId);
    const endPerson = family.persons.find(p => p.id === path[path.length - 1].personId);
    
    if (!startPerson || !endPerson) return "Relation inconnue.";
    
    // Pour les relations directes simples
    if (path.length === 2) {
      const rel = path[1].relationship;
      if (!rel) return "Relation directe inconnue.";
      
      if (rel.type === "parent" && rel.sourceId === path[0].personId) {
        return `${startPerson.prenom} est ${startPerson.sexe === "M" ? "le père" : "la mère"} de ${endPerson.prenom}.`;
      } else if (rel.type === "parent" && rel.targetId === path[0].personId) {
        return `${startPerson.prenom} est ${startPerson.sexe === "M" ? "le fils" : "la fille"} de ${endPerson.prenom}.`;
      } else if (rel.type === "conjoint") {
        return `${startPerson.prenom} est ${rel.sousType === "marie" ? "marié(e)" : "en couple"} avec ${endPerson.prenom}.`;
      }
    }
    
    // Pour les frères et sœurs
    if (path.length === 3 && isFullSiblingPath(path)) {
      return `${startPerson.prenom} et ${endPerson.prenom} sont ${
        startPerson.sexe === endPerson.sexe ? 
          (startPerson.sexe === "M" ? "frères" : "sœurs") : 
          "frère et sœur"
      } (ils partagent les mêmes parents).`;
    }
    
    // Pour les grands-parents / petits-enfants
    if (path.length === 3 && path[1].relationship?.type === "parent" && path[2].relationship?.type === "parent") {
      if (path[1].relationship.targetId === path[0].personId) {
        return `${startPerson.prenom} est ${
          startPerson.sexe === "M" ? "le grand-père" : "la grand-mère"
        } de ${endPerson.prenom}.`;
      } else {
        return `${startPerson.prenom} est ${
          startPerson.sexe === "M" ? "le petit-fils" : "la petite-fille"
        } de ${endPerson.prenom}.`;
      }
    }
    
    // Pour les oncles/tantes ou neveux/nièces
    if (path.length === 4 && isUncleAuntNephewNiecePath(path, family)) {
      const middlePerson = family.persons.find(p => p.id === path[2].personId);
      if (!middlePerson) return "Relation oncle/tante ou neveu/nièce.";
      
      if (isUncleAuntPath(path)) {
        return `${startPerson.prenom} est ${
          startPerson.sexe === "M" ? "l'oncle" : "la tante"
        } de ${endPerson.prenom} (${middlePerson.prenom} est ${
          middlePerson.sexe === "M" ? "le père" : "la mère"
        } de ${endPerson.prenom} et ${
          startPerson.sexe === "M" ? "le frère" : "la sœur"
        } de ${middlePerson.prenom}).`;
      } else {
        return `${startPerson.prenom} est ${
          startPerson.sexe === "M" ? "le neveu" : "la nièce"
        } de ${endPerson.prenom} (${startPerson.prenom} est ${
          startPerson.sexe === "M" ? "le fils" : "la fille"
        } de ${middlePerson.prenom} qui est ${
          middlePerson.sexe === "M" ? "le frère" : "la sœur"
        } de ${endPerson.prenom}).`;
      }
    }
    
    // Pour les cousins
    if (path.length === 5 && isCousinPath(path, family)) {
      return `${startPerson.prenom} et ${endPerson.prenom} sont cousins (ils partagent un grand-parent commun).`;
    }
    
    // Relation complexe : construction étape par étape
    let explanation = `${startPerson.prenom} `;
    
    for (let i = 1; i < path.length; i++) {
      const currentPerson = family.persons.find(p => p.id === path[i].personId);
      const rel = path[i].relationship;
      
      if (!currentPerson || !rel) continue;
      
      const previousPerson = family.persons.find(p => p.id === path[i-1].personId);
      if (!previousPerson) continue;
      
      if (rel.type === "parent") {
        if (rel.sourceId === path[i-1].personId) {
          explanation += `est ${previousPerson.sexe === "M" ? "le père" : "la mère"} de ${currentPerson.prenom}`;
        } else {
          explanation += `est ${previousPerson.sexe === "M" ? "le fils" : "la fille"} de ${currentPerson.prenom}`;
        }
      } else if (rel.type === "conjoint") {
        explanation += `est ${rel.sousType === "marie" ? "marié(e)" : "en couple"} avec ${currentPerson.prenom}`;
      }
      
      explanation += i < path.length - 1 ? ", qui " : ".";
    }
    
    return explanation;
  }
  
  // Fonctions auxiliaires pour déterminer le type de chemin
  function isFullSiblingPath(path: PathNode[]): boolean {
    if (path.length !== 3) return false;
    
    const rel1 = path[1].relationship;
    const rel2 = path[2].relationship;
    
    return !!(rel1 && rel2 && 
      rel1.type === "parent" && rel2.type === "parent" &&
      rel1.sourceId === rel2.sourceId &&
      rel1.targetId === path[0].personId &&
      rel2.targetId === path[2].personId);
  }
  
  function isUncleAuntNephewNiecePath(path: PathNode[], family: Family): boolean {
    if (path.length !== 4) return false;
    
    // Vérifier si c'est un chemin oncle/tante ou neveu/nièce
    return isUncleAuntPath(path) || isNephewNiecePath(path);
  }
  
  function isUncleAuntPath(path: PathNode[]): boolean {
    if (path.length !== 4) return false;
    
    const rel1 = path[1].relationship;
    const rel2 = path[2].relationship;
    const rel3 = path[3].relationship;
    
    return !!(rel1 && rel2 && rel3 &&
      rel1.type === "parent" && 
      rel2.type === "parent" && 
      rel3.type === "parent" &&
      rel1.targetId === path[0].personId &&
      rel2.sourceId === rel1.sourceId &&
      rel3.targetId === path[3].personId);
  }
  
  function isNephewNiecePath(path: PathNode[]): boolean {
    if (path.length !== 4) return false;
    
    const rel1 = path[1].relationship;
    const rel2 = path[2].relationship;
    const rel3 = path[3].relationship;
    
    return !!(rel1 && rel2 && rel3 &&
      rel1.type === "parent" && 
      rel2.type === "parent" && 
      rel3.type === "parent" &&
      rel1.sourceId === path[0].personId &&
      rel2.targetId === path[1].personId &&
      rel3.sourceId === rel2.sourceId);
  }
  
  function isCousinPath(path: PathNode[], family: Family): boolean {
    if (path.length !== 5) return false;
    
    const rel1 = path[1].relationship;
    const rel2 = path[2].relationship;
    const rel3 = path[3].relationship;
    const rel4 = path[4].relationship;
    
    return !!(rel1 && rel2 && rel3 && rel4 &&
      rel1.type === "parent" && 
      rel2.type === "parent" && 
      rel3.type === "parent" && 
      rel4.type === "parent" &&
      rel2.sourceId === rel3.sourceId);
  }


// Ajoutez cet export default à la fin du fichier
export default SearchResults;