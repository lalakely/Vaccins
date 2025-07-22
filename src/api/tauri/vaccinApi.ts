import { invoke } from '@tauri-apps/api';

export interface Vaccin {
  id?: number;
  nom: string;
  description?: string;
  type: string; 
  age_recommande_debut?: number;
  age_recommande_fin?: number;
  doses_recommandees?: number;
  rappel_recommande?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VaccinPrerequis {
  id?: number;
  vaccin_id: number;
  prerequis_id: number;
  strict: boolean;
  created_at?: string;
}

export interface VaccinSuite {
  id?: number;
  vaccin_id: number;
  vaccin_suivant_id: number;
  intervalle_jours: number;
  intervalle_max_jours?: number;
  created_at?: string;
}

/**
 * Crée un nouveau vaccin
 */
export const createVaccin = async (vaccin: Vaccin): Promise<number> => {
  try {
    return await invoke('vaccin_create', { vaccin });
  } catch (error) {
    console.error('Erreur lors de la création du vaccin:', error);
    throw error;
  }
};

/**
 * Récupère un vaccin par son ID
 */
export const getVaccinById = async (vaccin_id: number): Promise<Vaccin> => {
  try {
    return await invoke('vaccin_get_by_id', { vaccin_id });
  } catch (error) {
    console.error('Erreur lors de la récupération du vaccin:', error);
    throw error;
  }
};

/**
 * Met à jour un vaccin
 */
export const updateVaccin = async (vaccin: Vaccin): Promise<void> => {
  try {
    return await invoke('vaccin_update', { vaccin });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du vaccin:', error);
    throw error;
  }
};

/**
 * Supprime un vaccin
 */
export const deleteVaccin = async (vaccin_id: number): Promise<void> => {
  try {
    return await invoke('vaccin_delete', { vaccin_id });
  } catch (error) {
    console.error('Erreur lors de la suppression du vaccin:', error);
    throw error;
  }
};

/**
 * Récupère tous les vaccins
 */
export const getAllVaccins = async (): Promise<Vaccin[]> => {
  try {
    return await invoke('vaccin_get_all');
  } catch (error) {
    console.error('Erreur lors de la récupération des vaccins:', error);
    throw error;
  }
};

// Fonctions pour les prérequis de vaccin

/**
 * Ajoute un prérequis à un vaccin
 */
export const addVaccinPrerequis = async (
  vaccin_id: number, 
  prerequis_id: number, 
  strict: boolean
): Promise<number> => {
  try {
    return await invoke('vaccin_add_prerequis', { 
      vaccin_id, 
      prerequis_id, 
      strict 
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du prérequis:', error);
    throw error;
  }
};

/**
 * Récupère tous les prérequis d'un vaccin
 */
export const getVaccinPrerequis = async (vaccin_id: number): Promise<VaccinPrerequis[]> => {
  try {
    return await invoke('vaccin_get_prerequis', { vaccin_id });
  } catch (error) {
    console.error('Erreur lors de la récupération des prérequis:', error);
    throw error;
  }
};

/**
 * Supprime un prérequis
 */
export const deleteVaccinPrerequis = async (prerequis_id: number): Promise<void> => {
  try {
    return await invoke('vaccin_delete_prerequis', { prerequis_id });
  } catch (error) {
    console.error('Erreur lors de la suppression du prérequis:', error);
    throw error;
  }
};

// Fonctions pour les suites de vaccin

/**
 * Ajoute une suite à un vaccin
 */
export const addVaccinSuite = async (suite: VaccinSuite): Promise<number> => {
  try {
    return await invoke('vaccin_add_suite', { suite });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la suite:', error);
    throw error;
  }
};

/**
 * Récupère toutes les suites d'un vaccin
 */
export const getVaccinSuites = async (vaccin_id: number): Promise<VaccinSuite[]> => {
  try {
    return await invoke('vaccin_get_suites', { vaccin_id });
  } catch (error) {
    console.error('Erreur lors de la récupération des suites:', error);
    throw error;
  }
};

/**
 * Supprime une suite
 */
export const deleteVaccinSuite = async (suite_id: number): Promise<void> => {
  try {
    return await invoke('vaccin_delete_suite', { suite_id });
  } catch (error) {
    console.error('Erreur lors de la suppression de la suite:', error);
    throw error;
  }
};
