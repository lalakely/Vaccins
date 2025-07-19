// Définition de l'interface Vaccine partagée dans toute l'application
export interface Vaccine {
  id: number;
  Nom: string;
  Duree: string | number; // Peut être une chaîne ou un nombre selon les composants
  Date_arrivee: string;
  Date_peremption: string;
  Description: string;
  Lot: string;
  Stock: number;
  Age_Annees?: number;
  Age_Mois?: number;
  Age_Jours?: number;
  [key: string]: any;
}

// Interface pour les vaccins avec relations (suites et prérequis)
export interface VaccineWithRelations extends Vaccine {
  strict?: boolean; // Flag indiquant si un prérequis ou suite est strict
  delai?: number; // Délai en jours pour un vaccin suite
  type?: 'strict' | 'recommande' | 'rappel'; // Type de relation
}

// Types liés aux statistiques des vaccins
export interface VaccineStats {
  total: number;
  inStock: number;
  outOfStock: number;
  expired: number;
}
