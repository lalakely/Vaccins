import { invoke } from '@tauri-apps/api';

export interface User {
  id?: number;
  username: string;
  password_hash: string;
  account_type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Inscrit un nouvel utilisateur
 */
export const registerUser = async (
  username: string, 
  password_hash: string, 
  account_type?: string
): Promise<number> => {
  try {
    return await invoke('user_register', {
      username,
      password_hash,
      account_type
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

/**
 * Connecte un utilisateur
 */
export const loginUser = async (
  username: string,
  ip_address: string
): Promise<User> => {
  try {
    return await invoke('user_login', {
      username,
      ip_address
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
};

/**
 * Déconnecte un utilisateur
 */
export const logoutUser = async (user_id: number): Promise<void> => {
  try {
    return await invoke('user_logout', { user_id });
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    throw error;
  }
};

/**
 * Récupère un utilisateur par son ID
 */
export const getUserById = async (user_id: number): Promise<User> => {
  try {
    return await invoke('user_get_by_id', { user_id });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Récupère un utilisateur par son nom d'utilisateur
 */
export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    return await invoke('user_get_by_username', { username });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Met à jour un utilisateur
 */
export const updateUser = async (user: User): Promise<void> => {
  try {
    return await invoke('user_update', { user });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Supprime un utilisateur
 */
export const deleteUser = async (user_id: number): Promise<void> => {
  try {
    return await invoke('user_delete', { user_id });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * Récupère tous les utilisateurs
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    return await invoke('user_get_all');
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};
