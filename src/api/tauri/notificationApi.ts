import { invoke } from '@tauri-apps/api';

export interface Notification {
  id?: number;
  user_id?: number;
  message: string;
  type: string;
  status: string;
  lien?: string;
  date_expiration?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Crée une nouvelle notification
 */
export const createNotification = async (notification: Notification): Promise<number> => {
  try {
    return await invoke('notification_create', { notification });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    throw error;
  }
};

/**
 * Récupère une notification par son ID
 */
export const getNotificationById = async (notification_id: number): Promise<Notification> => {
  try {
    return await invoke('notification_get_by_id', { notification_id });
  } catch (error) {
    console.error('Erreur lors de la récupération de la notification:', error);
    throw error;
  }
};

/**
 * Marque une notification comme lue
 */
export const markNotificationAsRead = async (notification_id: number): Promise<void> => {
  try {
    return await invoke('notification_mark_as_read', { notification_id });
  } catch (error) {
    console.error('Erreur lors du marquage de la notification comme lue:', error);
    throw error;
  }
};

/**
 * Marque toutes les notifications comme lues
 * @param user_id ID de l'utilisateur (optionnel, toutes les notifs si null)
 */
export const markAllNotificationsAsRead = async (user_id?: number): Promise<void> => {
  try {
    return await invoke('notification_mark_all_as_read', { user_id });
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    throw error;
  }
};

/**
 * Supprime une notification
 */
export const deleteNotification = async (notification_id: number): Promise<void> => {
  try {
    return await invoke('notification_delete', { notification_id });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    throw error;
  }
};

/**
 * Récupère le nombre de notifications non lues
 * @param user_id ID de l'utilisateur (optionnel, toutes les notifs si null)
 */
export const getUnreadNotificationsCount = async (user_id?: number): Promise<number> => {
  try {
    return await invoke('notification_get_unread_count', { user_id });
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
    throw error;
  }
};

/**
 * Récupère les notifications pour un utilisateur
 * @param user_id ID de l'utilisateur (optionnel, toutes les notifs si null)
 * @param limit Nombre maximum de notifications à récupérer
 * @param offset Décalage pour la pagination
 * @param include_read Inclure les notifications lues
 */
export const getNotificationsForUser = async (
  user_id?: number,
  limit: number = 10,
  offset: number = 0,
  include_read: boolean = false
): Promise<Notification[]> => {
  try {
    return await invoke('notification_get_for_user', {
      user_id,
      limit,
      offset,
      include_read
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
};

/**
 * Purge les notifications expirées
 * @returns Le nombre de notifications purgées
 */
export const purgeExpiredNotifications = async (): Promise<number> => {
  try {
    return await invoke('notification_purge_expired');
  } catch (error) {
    console.error('Erreur lors de la purge des notifications expirées:', error);
    throw error;
  }
};
