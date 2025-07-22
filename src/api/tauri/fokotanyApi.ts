import { invoke } from '@tauri-apps/api';

export interface Fokotany {
  id?: number;
  nom: string;
  commune?: string;
  district?: string;
  region?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Crée un nouveau fokotany
 */
export const createFokotany = async (fokotany: Fokotany): Promise<number> => {
  try {
    return await invoke('fokotany_create', { fokotany });
  } catch (error) {
    console.error('Erreur lors de la création du fokotany:', error);
    throw error;
  }
};

/**
 * Récupère un fokotany par son ID
 */
export const getFokotanyById = async (fokotany_id: number): Promise<Fokotany> => {
  try {
    return await invoke('fokotany_get_by_id', { fokotany_id });
  } catch (error) {
    console.error('Erreur lors de la récupération du fokotany:', error);
    throw error;
  }
};

/**
 * Récupère un fokotany par son nom
 */
export const getFokotanyByName = async (name: string): Promise<Fokotany | null> => {
  try {
    return await invoke('fokotany_get_by_name', { name });
  } catch (error) {
    console.error('Erreur lors de la récupération du fokotany par nom:', error);
    throw error;
  }
};

/**
 * Met à jour un fokotany
 */
export const updateFokotany = async (fokotany: Fokotany): Promise<void> => {
  try {
    return await invoke('fokotany_update', { fokotany });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du fokotany:', error);
    throw error;
  }
};

/**
 * Supprime un fokotany
 */
export const deleteFokotany = async (fokotany_id: number): Promise<void> => {
  try {
    return await invoke('fokotany_delete', { fokotany_id });
  } catch (error) {
    console.error('Erreur lors de la suppression du fokotany:', error);
    throw error;
  }
};

/**
 * Récupère tous les fokotany
 */
export const getAllFokotany = async (): Promise<Fokotany[]> => {
  try {
    return await invoke('fokotany_get_all');
  } catch (error) {
    console.error('Erreur lors de la récupération des fokotany:', error);
    throw error;
  }
};
