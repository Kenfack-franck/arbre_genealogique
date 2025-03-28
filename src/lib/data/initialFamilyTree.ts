// src/lib/data/initialFamilyTree.ts
import { FamilyTreeData } from '../models/FamilyTree';
// import { Person } from '../models/Person';
// import { Relationship, RelationType, RelationSubType } from '../models/Relationship';

export const initialFamilyTreeData: FamilyTreeData = {
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
  metadata: {
    nom: "Famille Martin",
    dateCreation: "2025-03-28T10:00:00Z",
    dateMiseAJour: "2025-03-28T10:00:00Z"
  }
};