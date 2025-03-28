// src/lib/models/Person.ts
export interface Person {
    id: string;
    nom: string;
    prenom: string;
    sexe: "M" | "F" | "A";  // M = Masculin, F = Féminin, A = Autre
    birthDate: string | null;
    deathDate: string | null;
    etat: "vivant" | "mort";
  }