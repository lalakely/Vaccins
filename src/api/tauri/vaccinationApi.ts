import { invoke } from '@tauri-apps/api';

export interface Vaccination {
  id?: number;
  enfant_id: number;
  vaccin_id: number;
  date_vaccination: string;
  dose: number;
  statut: string;
  effets_secondaires?: string;
  administrateur?: string;
  lot_vaccin?: string;
  rappel?: boolean;
  date_prochain_rappel?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Crée une nouvelle vaccination
 */
export const createVaccination = async (vaccination: Vaccination): Promise<number> => {
  try {
    return await invoke('vaccination_create', { vaccination });
  } catch (error) {
    console.error('Erreur lors de la création de la vaccination:', error);
    throw error;
  }
};

/**
 * Récupère une vaccination par son ID
 */
export const getVaccinationById = async (vaccination_id: number): Promise<Vaccination> => {
  try {
    return await invoke('vaccination_get_by_id', { vaccination_id });
  } catch (error) {
    console.error('Erreur lors de la récupération de la vaccination:', error);
    throw error;
  }
};

/**
 * Met à jour une vaccination
 */
export const updateVaccination = async (vaccination: Vaccination): Promise<void> => {
  try {
    return await invoke('vaccination_update', { vaccination });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la vaccination:', error);
    throw error;
  }
};

/**
 * Supprime une vaccination
 */
export const deleteVaccination = async (vaccination_id: number): Promise<void> => {
  try {
    return await invoke('vaccination_delete', { vaccination_id });
  } catch (error) {
    console.error('Erreur lors de la suppression de la vaccination:', error);
    throw error;
  }
};

/**
 * Récupère toutes les vaccinations
 */
export const getAllVaccinations = async (): Promise<Vaccination[]> => {
  try {
    return await invoke('vaccination_get_all');
  } catch (error) {
    console.error('Erreur lors de la récupération des vaccinations:', error);
    throw error;
  }
};

/**
 * Récupère les vaccinations d'un enfant
 */
export const getVaccinationsByEnfant = async (enfant_id: number): Promise<Vaccination[]> => {
  try {
    return await invoke('vaccination_get_by_enfant', { enfant_id });
  } catch (error) {
    console.error('Erreur lors de la récupération des vaccinations pour l\'enfant:', error);
    throw error;
  }
};

/**
 * Récupère les vaccinations pour un vaccin spécifique
 */
export const getVaccinationsByVaccin = async (vaccin_id: number): Promise<Vaccination[]> => {
  try {
    return await invoke('vaccination_get_by_vaccin', { vaccin_id });
  } catch (error) {
    console.error('Erreur lors de la récupération des vaccinations pour le vaccin:', error);
    throw error;
  }
};
