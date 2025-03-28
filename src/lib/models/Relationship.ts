// src/lib/models/Relationship.ts
export type RelationType = "parent" | "conjoint" | "enfant";
export type RelationSubType = "pere" | "mere" | "adoptif" | "marie" | "non_marie" | "biologique" | "adopte";

export interface Relationship {
  id: string;
  type: RelationType;
  sourceId: string;  // ID de la personne source
  targetId: string;  // ID de la personne cible
  sousType: RelationSubType;
  dateDebut: string | null;
  dateFin: string | null;
}