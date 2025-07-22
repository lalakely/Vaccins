import { invoke } from '@tauri-apps/api';

/**
 * Initialise la base de données SQLite locale
 * @returns Promise avec un message de confirmation ou une erreur
 */
export const initializeDatabase = async (): Promise<string> => {
  try {
    return await invoke('init_database');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

/**
 * Récupère le chemin de la base de données SQLite
 * @returns Promise avec le chemin du fichier de la base de données
 */
export const getDatabasePath = async (): Promise<string> => {
  try {
    return await invoke('get_database_path');
  } catch (error) {
    console.error('Erreur lors de la récupération du chemin de la base de données:', error);
    throw error;
  }
};
