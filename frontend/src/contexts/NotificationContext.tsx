import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Types pour les notifications
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationCategory = 
  | 'action_feedback'    // Confirmation d'actions
  | 'vaccination_alert'  // Alertes liées aux vaccinations
  | 'statistics'         // Statistiques et rapports
  | 'system'             // Système et administration
  | 'user_activity';     // Activité utilisateur

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  actionLink?: string;
  entityType?: string;
  entityId?: number;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showToast: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: number) => void;
  fetchNotifications: () => void;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  // Fonction pour récupérer les notifications depuis le serveur
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/api/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter((notif: Notification) => !notif.isRead).length);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effet pour charger les notifications au démarrage et configurer le polling
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Polling toutes les 30 secondes pour les nouvelles notifications
      const intervalId = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [user]);

  // Fonction pour afficher une notification temporaire (toast)
  const showToast = (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    // Créer une notification temporaire avec un ID local négatif pour le distinguer
    const tempNotification: Notification = {
      ...notification,
      id: -Date.now(), // ID temporaire négatif
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    // Ajouter la notification temporaire à la liste
    setNotifications(prev => [tempNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Envoyer la notification au serveur si l'utilisateur est connecté
    if (user) {
      axios.post('http://localhost:3000/api/notifications', notification)
        .catch(error => console.error('Erreur lors de l\'envoi de la notification:', error));
    }
  };

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId: number) => {
    try {
      // Mettre à jour l'état local immédiatement pour une UI réactive
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Mettre à jour sur le serveur
      if (notificationId > 0) { // Seulement si c'est une notification persistante
        await axios.put(`http://localhost:3000/api/notifications/${notificationId}/read`);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      // Mettre à jour l'état local immédiatement
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      
      // Mettre à jour sur le serveur
      await axios.put('http://localhost:3000/api/notifications/read-all');
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  };

  // Fonction pour supprimer une notification
  const deleteNotification = async (notificationId: number) => {
    try {
      // Mettre à jour l'état local immédiatement
      const notifToDelete = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      if (notifToDelete && !notifToDelete.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Supprimer sur le serveur
      if (notificationId > 0) { // Seulement si c'est une notification persistante
        await axios.delete(`http://localhost:3000/api/notifications/${notificationId}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    showToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    isLoading
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
