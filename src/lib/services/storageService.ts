// storageService.ts
import { FamilyTreeData } from '../models/FamilyTree';


export async function saveFamilyTree(familyTree: FamilyTreeData): Promise<void> {
    localStorage.setItem('familyTree', JSON.stringify(familyTree));
  }
  
  export async function loadFamilyTree(): Promise<FamilyTreeData | null> {
    const data = localStorage.getItem('familyTree');
    if (!data) {
      return null;
    }
    return JSON.parse(data) as FamilyTreeData;
  }
  
  // Initialisation avec les données par défaut
  export async function initializeIfEmpty(): Promise<FamilyTreeData> {
    const existingData = await loadFamilyTree();
    if (existingData) {
      return existingData;
    }
    
    // Importer les données initiales
    const { initialFamilyTreeData } = await import('../data/initialFamilyTree');
    await saveFamilyTree(initialFamilyTreeData);
    return initialFamilyTreeData;
  }