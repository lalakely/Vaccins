import { invoke } from '@tauri-apps/api';

export interface Enfant {
  id?: number;
  code?: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  nom_mere?: string;
  nom_pere?: string;
  contact?: string;
  adresse?: string;
  fokotany_id?: number;
  hameau_id?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Crée un nouvel enfant
 */
export const createEnfant = async (enfant: Enfant): Promise<number> => {
  try {
    return await invoke('enfant_create', { enfant });
  } catch (error) {
    console.error('Erreur lors de la création de l\'enfant:', error);
    throw error;
  }
};

/**
 * Récupère un enfant par son ID
 */
export const getEnfantById = async (enfant_id: number): Promise<Enfant> => {
  try {
    return await invoke('enfant_get_by_id', { enfant_id });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'enfant:', error);
    throw error;
  }
};

/**
 * Récupère un enfant par son code
 */
export const getEnfantByCode = async (code: string): Promise<Enfant | null> => {
  try {
    return await invoke('enfant_get_by_code', { code });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'enfant par code:', error);
    throw error;
  }
};

/**
 * Met à jour un enfant
 */
export const updateEnfant = async (enfant: Enfant): Promise<void> => {
  try {
    return await invoke('enfant_update', { enfant });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'enfant:', error);
    throw error;
  }
};

/**
 * Supprime un enfant
 */
export const deleteEnfant = async (enfant_id: number, user_id?: number): Promise<void> => {
  try {
    return await invoke('enfant_delete', { enfant_id, user_id });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'enfant:', error);
    throw error;
  }
};

/**
 * Récupère tous les enfants
 */
export const getAllEnfants = async (): Promise<Enfant[]> => {
  try {
    return await invoke('enfant_get_all');
  } catch (error) {
    console.error('Erreur lors de la récupération des enfants:', error);
    throw error;
  }
};
