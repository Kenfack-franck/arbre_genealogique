// src/lib/data/initialData.ts
import { FamiliesData, Family } from '../models/Families';
import { Person } from '../models/Person';
import { Relationship } from '../models/Relationship';

// Créer une famille Martin
const familyMartin: Family = {
  id: 'family-martin',
  name: 'Famille Martin',
  description: 'Arbre généalogique de la famille Martin',
  persons: [
    {
      id: "p1",
      nom: "Martin",
      prenom: "Jean",
      sexe: "M",
      birthDate: "1950-05-15",
      deathDate: null,
      etat: "vivant"
    },
    {
      id: "p2",
      nom: "Dupont",
      prenom: "Marie",
      sexe: "F",
      birthDate: "1952-08-22",
      deathDate: null,
      etat: "vivant"
    },
    {
      id: "p3",
      nom: "Martin",
      prenom: "Sophie",
      sexe: "F",
      birthDate: "1975-03-10",
      deathDate: null,
      etat: "vivant"
    },
    {
      id: "p4",
      nom: "Martin",
      prenom: "Paul",
      sexe: "M",
      birthDate: "1978-11-30",
      deathDate: null,
      etat: "vivant"
    },
    {
      id: "p5",
      nom: "Dubois",
      prenom: "Thomas",
      sexe: "M",
      birthDate: "1974-06-18",
      deathDate: null,
      etat: "vivant"
    },
    {
      id: "p6",
      nom: "Martin-Dubois",
      prenom: "Emma",
      sexe: "F",
      birthDate: "2005-04-12",
      deathDate: null,
      etat: "vivant"
    },
    {
      id: "p7",
      nom: "Martin",
      prenom: "Lucas",
      sexe: "M",
      birthDate: "2008-07-23",
      deathDate: null,
      etat: "vivant"
    }
  ],
  relationships: [
    // Jean et Marie sont mariés
    {
      id: "r1",
      type: "conjoint",
      sourceId: "p1",
      targetId: "p2",
      sousType: "marie",
      dateDebut: "1974-06-15",
      dateFin: null
    },
    // Jean est le père de Sophie
    {
      id: "r2",
      type: "parent",
      sourceId: "p1",
      targetId: "p3",
      sousType: "pere",
      dateDebut: null,
      dateFin: null
    },
    // Marie est la mère de Sophie
    {
      id: "r3",
      type: "parent",
      sourceId: "p2",
      targetId: "p3",
      sousType: "mere",
      dateDebut: null,
      dateFin: null
    },
    // Jean est le père de Paul
    {
      id: "r4",
      type: "parent",
      sourceId: "p1",
      targetId: "p4",
      sousType: "pere",
      dateDebut: null,
      dateFin: null
    },
    // Marie est la mère de Paul
    {
      id: "r5",
      type: "parent",
      sourceId: "p2",
      targetId: "p4",
      sousType: "mere",
      dateDebut: null,
      dateFin: null
    },
    // Sophie et Thomas sont mariés
    {
      id: "r6",
      type: "conjoint",
      sourceId: "p3",
      targetId: "p5",
      sousType: "marie",
      dateDebut: "2003-09-20",
      dateFin: null
    },
    // Sophie est la mère d'Emma
    {
      id: "r7",
      type: "parent",
      sourceId: "p3",
      targetId: "p6",
      sousType: "mere",
      dateDebut: null,
      dateFin: null
    },
    // Thomas est le père d'Emma
    {
      id: "r8",
      type: "parent",
      sourceId: "p5",
      targetId: "p6",
      sousType: "pere",
      dateDebut: null,
      dateFin: null
    },
    // Sophie est la mère de Lucas
    {
      id: "r9",
      type: "parent",
      sourceId: "p3",
      targetId: "p7",
      sousType: "mere",
      dateDebut: null,
      dateFin: null
    },
    // Thomas est le père de Lucas
    {
      id: "r10",
      type: "parent",
      sourceId: "p5",
      targetId: "p7",
      sousType: "pere",
      dateDebut: null,
      dateFin: null
    }
  ],
  createdAt: "2025-03-28T10:00:00Z",
  updatedAt: "2025-03-28T10:00:00Z"
};

// Créer une famille Durand
const familyDurand: Family = {
  id: 'family-durand',
  name: 'Famille Durand',
  description: 'Arbre généalogique de la famille Durand',
  persons: [
    {
      id: "d1",
      nom: "Durand",
      prenom: "Pierre",
      sexe: "M",
      birthDate: "1945-10-05",
      deathDate: null,
      etat: "vivant"
    },
    {
      id: "d2",
      nom: "Moreau",
      prenom: "Jeanne",
      sexe: "F",
      birthDate: "1948-04-12",
      deathDate: "2020-08-30",
      etat: "mort"
    },
    {
      id: "d3",
      nom: "Durand",
      prenom: "Marc",
      sexe: "M",
      birthDate: "1970-07-22",
      deathDate: null,
      etat: "vivant"
    },
    {
      id: "d4",
      nom: "Durand",
      prenom: "Claire",
      sexe: "F",
      birthDate: "1972-11-03",
      deathDate: null,
      etat: "vivant"
    }
  ],
  relationships: [
    // Pierre et Jeanne sont mariés
    {
      id: "rd1",
      type: "conjoint",
      sourceId: "d1",
      targetId: "d2",
      sousType: "marie",
      dateDebut: "1969-04-18",
      dateFin: null
    },
    // Pierre est le père de Marc
    {
      id: "rd2",
      type: "parent",
      sourceId: "d1",
      targetId: "d3",
      sousType: "pere",
      dateDebut: null,
      dateFin: null
    },
    // Jeanne est la mère de Marc
    {
      id: "rd3",
      type: "parent",
      sourceId: "d2",
      targetId: "d3",
      sousType: "mere",
      dateDebut: null,
      dateFin: null
    },
    // Pierre est le père de Claire
    {
      id: "rd4",
      type: "parent",
      sourceId: "d1",
      targetId: "d4",
      sousType: "pere",
      dateDebut: null,
      dateFin: null
    },
    // Jeanne est la mère de Claire
    {
      id: "rd5",
      type: "parent",
      sourceId: "d2",
      targetId: "d4",
      sousType: "mere",
      dateDebut: null,
      dateFin: null
    }
  ],
  createdAt: "2025-03-28T11:00:00Z",
  updatedAt: "2025-03-28T11:00:00Z"
};

// Données initiales complètes
export const initialFamiliesData: FamiliesData = {
  families: [familyMartin, familyDurand],
  activeFamilyId: 'family-martin',
  lastUpdated: "2025-03-28T11:00:00Z"
};