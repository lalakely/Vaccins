import { invoke } from '@tauri-apps/api';

export interface Hameau {
  id?: number;
  nom: string;
  fokotany_id?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Crée un nouveau hameau
 */
export const createHameau = async (hameau: Hameau): Promise<number> => {
  try {
    return await invoke('hameau_create', { hameau });
  } catch (error) {
    console.error('Erreur lors de la création du hameau:', error);
    throw error;
  }
};

/**
 * Récupère un hameau par son ID
 */
export const getHameauById = async (hameau_id: number): Promise<Hameau> => {
  try {
    return await invoke('hameau_get_by_id', { hameau_id });
  } catch (error) {
    console.error('Erreur lors de la récupération du hameau:', error);
    throw error;
  }
};

/**
 * Récupère un hameau par son nom
 */
export const getHameauByName = async (name: string): Promise<Hameau | null> => {
  try {
    return await invoke('hameau_get_by_name', { name });
  } catch (error) {
    console.error('Erreur lors de la récupération du hameau par nom:', error);
    throw error;
  }
};

/**
 * Met à jour un hameau
 */
export const updateHameau = async (hameau: Hameau): Promise<void> => {
  try {
    return await invoke('hameau_update', { hameau });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du hameau:', error);
    throw error;
  }
};

/**
 * Supprime un hameau
 */
export const deleteHameau = async (hameau_id: number): Promise<void> => {
  try {
    return await invoke('hameau_delete', { hameau_id });
  } catch (error) {
    console.error('Erreur lors de la suppression du hameau:', error);
    throw error;
  }
};

/**
 * Récupère tous les hameaux
 */
export const getAllHameaux = async (): Promise<Hameau[]> => {
  try {
    return await invoke('hameau_get_all');
  } catch (error) {
    console.error('Erreur lors de la récupération des hameaux:', error);
    throw error;
  }
};
