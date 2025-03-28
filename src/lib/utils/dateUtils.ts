// src/lib/utils/dateUtils.ts
import { Person } from '../models/Person';

export function calculateAge(person: Person): number {
  if (!person.birthDate) return 0;
  
  const birthDate = new Date(person.birthDate);
  const endDate = person.etat === 'mort' && person.deathDate 
    ? new Date(person.deathDate) 
    : new Date();
  
  const ageMs = endDate.getTime() - birthDate.getTime();
  const ageDate = new Date(ageMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}