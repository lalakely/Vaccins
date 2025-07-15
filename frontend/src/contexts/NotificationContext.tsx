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
  isLoading: boolean;
  addNotification: (notification: Partial<Notification>) => void;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  showToast: (notification: Partial<Notification>) => void;
  fetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Moving this hook to its own named function to help Fast Refresh work properly
function useNotificationHook() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export const useNotification = useNotificationHook;

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  // Fonction pour récupérer les notifications depuis le serveur
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn("Aucun token d'authentification trouvé");
        return;
      }
      
      // Utiliser un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes

      const response = await axios.get('http://localhost:3000/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        signal: controller.signal,
        timeout: 5000 // Timeout de 5 secondes (redondant avec AbortController mais plus sûr)
      });

      clearTimeout(timeoutId);

      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des notifications:', error);
      
      // Gérer les différents types d'erreurs
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
        console.warn("Timeout lors de la récupération des notifications");
      } else if (error.response) {
        console.warn(`Erreur ${error.response.status} lors de la récupération des notifications`);
      }
      
      // En cas d'erreur, afficher une notification d'erreur
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Effet pour charger les notifications au démarrage et configurer le polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Polling toutes les 30 secondes pour les nouvelles notifications
      const intervalId = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);

  // Fonction pour afficher une notification temporaire (toast)
  const showToast = (notification: Partial<Notification>) => {
    const now = new Date();
    // Générer un ID unique pour éviter les doublons
    const uniqueId = notification.id || Date.now() + Math.floor(Math.random() * 1000);
    
    // Créer des dates dans un format compatible avec la base de données MySQL
    const expiresDate = notification.expiresAt 
      ? new Date(notification.expiresAt)
      : new Date(now.getTime() + 10000); // 10 secondes par défaut
      
    const newNotification: Notification = {
      id: uniqueId,
      title: notification.title || 'Notification',
      message: notification.message || '',
      type: notification.type || 'info',
      category: notification.category || 'system',
      isRead: false,
      actionLink: notification.actionLink,
      entityType: notification.entityType,
      entityId: notification.entityId,
      createdAt: now.toISOString().slice(0, 19).replace('T', ' '),
      expiresAt: expiresDate.toISOString().slice(0, 19).replace('T', ' ') // Format MySQL YYYY-MM-DD HH:MM:SS
    };

    // Ajouter à l'état local
    setNotifications((prev: Notification[]) => [newNotification, ...prev]);
    setUnreadCount((prev: number) => prev + 1);

    // Envoyer au serveur si authentifié
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        // Utiliser un AbortController pour gérer le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
        
        axios.post('http://localhost:3000/api/notifications', newNotification, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          timeout: 5000 // Timeout de 5 secondes
        }).then(() => {
          clearTimeout(timeoutId);
          console.log('Toast envoyé au serveur avec succès');
        }).catch((error: any) => {
          console.error('Erreur lors de l\'envoi du toast:', error);
          
          // Gérer les différents types d'erreurs
          if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
            console.warn("Timeout lors de l'envoi du toast");
          } else if (error.response) {
            console.warn(`Erreur ${error.response.status} lors de l'envoi du toast`);
          }
          
          console.warn('Le toast reste uniquement dans l\'UI locale');
        });
      }
    }

    // Programmer la suppression automatique après 10 secondes
    setTimeout(() => {
      setNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== newNotification.id));
      if (!newNotification.isRead) {
        setUnreadCount((prev: number) => Math.max(0, prev - 1));
      }
    }, 10000);
  };

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId: number) => {
    try {
      // Mettre à jour l'état local immédiatement
      setNotifications((prev: Notification[]) => 
        prev.map((notif: Notification) => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      // Mettre à jour le compteur de notifications non lues
      setUnreadCount((prev: number) => Math.max(0, prev - 1));
      
      // Mettre à jour sur le serveur si l'API est disponible
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.warn('Aucun token d\'authentification trouvé');
          return;
        }
        
        try {
          // Utiliser un AbortController pour gérer le timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
          
          await axios.patch(`http://localhost:3000/api/notifications/${notificationId}/read`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal,
            timeout: 5000 // Timeout de 5 secondes
          });
          
          clearTimeout(timeoutId);
          console.log(`Notification ${notificationId} marquée comme lue sur le serveur`);
        } catch (error: any) {
          console.error('Erreur lors du marquage de la notification comme lue:', error);
          
          // Gérer les différents types d'erreurs
          if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
            console.warn("Timeout lors du marquage de la notification comme lue");
          } else if (error.response) {
            console.warn(`Erreur ${error.response.status} lors du marquage de la notification comme lue`);
          }
          
          console.warn('La notification reste marquée comme lue uniquement dans l\'UI locale');
        }
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      // Mettre à jour l'état local immédiatement
      setNotifications((prev: Notification[]) => 
        prev.map((notif: Notification) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      
      // Mettre à jour sur le serveur si l'API est disponible
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.warn('Aucun token d\'authentification trouvé');
          return;
        }
        
        try {
          // Utiliser un AbortController pour gérer le timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
          
          await axios.patch('http://localhost:3000/api/notifications/read-all', {}, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal,
            timeout: 5000 // Timeout de 5 secondes
          });
          
          clearTimeout(timeoutId);
          console.log('Toutes les notifications marquées comme lues sur le serveur');
        } catch (error: any) {
          console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
          
          // Gérer les différents types d'erreurs
          if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
            console.warn("Timeout lors du marquage de toutes les notifications comme lues");
          } else if (error.response) {
            console.warn(`Erreur ${error.response.status} lors du marquage de toutes les notifications comme lues`);
          }
          
          console.warn('Les notifications restent marquées comme lues uniquement dans l\'UI locale');
        }
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  };

  // Fonction pour supprimer une notification spécifique
  const deleteNotification = async (notificationId: number) => {
    try {
      // Mettre à jour l'état local immédiatement
      setNotifications((prev: Notification[]) => prev.filter((notif: Notification) => notif.id !== notificationId));
      
      // Mettre à jour le compteur de notifications non lues si nécessaire
      const wasUnread = notifications.find(notif => notif.id === notificationId && !notif.isRead);
      if (wasUnread) {
        setUnreadCount((prev: number) => Math.max(0, prev - 1));
      }
      
      // Supprimer sur le serveur si c'est une notification persistante et si l'API est disponible
      if (notificationId > 0) {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('Aucun token d\'authentification trouvé');
          return;
        }
        
        try {
          // Utiliser un AbortController pour gérer le timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
          
          await axios.delete(`http://localhost:3000/api/notifications/${notificationId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal,
            timeout: 5000 // Timeout de 5 secondes
          });
          
          clearTimeout(timeoutId);
          console.log(`Notification ${notificationId} supprimée du serveur`);
        } catch (error: any) {
          console.error('Erreur lors de la suppression de la notification:', error);
          
          // Gérer les différents types d'erreurs
          if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
            console.warn("Timeout lors de la suppression de la notification");
            // La notification est déjà supprimée de l'interface, donc ne pas la restaurer
          } else {
            // Restaurer la notification si l'API échoue pour d'autres raisons
            fetchNotifications();
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };

  // Fonction pour supprimer toutes les notifications
  const deleteAllNotifications = async () => {
    try {
      // Mettre à jour l'état local immédiatement
      setNotifications([]);
      setUnreadCount(0);
      
      // Supprimer sur le serveur si l'API est disponible
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Aucun token d\'authentification trouvé');
        return;
      }
      
      try {
        // Utiliser un AbortController pour gérer le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
        
        await axios.delete('http://localhost:3000/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal,
          timeout: 5000 // Timeout de 5 secondes
        });
        
        clearTimeout(timeoutId);
        
        // Aucune action supplémentaire nécessaire
      } catch (error: any) {
        console.error('Erreur lors de la suppression de toutes les notifications:', error);
        
        // Gérer les différents types d'erreurs
        if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
          console.warn("Timeout lors de la suppression de toutes les notifications");
        } else if (error.response) {
          console.warn(`Erreur ${error.response.status} lors de la suppression de toutes les notifications`);
        }
        
        // L'UI est déjà mise à jour, donc pas d'action supplémentaire nécessaire
        // Aucune action supplémentaire nécessaire
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les notifications:', error);
    }
  };

  // Fonction pour ajouter une notification
  const addNotification = async (notification: Partial<Notification>) => {
    // Générer un ID unique pour éviter les doublons
    const uniqueId = notification.id || Date.now() + Math.floor(Math.random() * 1000);
    
    const newNotification: Notification = {
      id: uniqueId,
      title: notification.title || 'Notification',
      message: notification.message || '',
      type: notification.type || 'info',
      category: notification.category || 'system',
      isRead: notification.isRead || false,
      actionLink: notification.actionLink,
      entityType: notification.entityType,
      entityId: notification.entityId,
      createdAt: notification.createdAt || new Date().toISOString(),
      expiresAt: notification.expiresAt
    };

    // Ajouter immédiatement à l'état local pour une UI réactive
    setNotifications((prev: Notification[]) => [newNotification, ...prev]);
    if (!newNotification.isRead) {
      setUnreadCount((prev: number) => prev + 1);
    }

    // Envoyer au serveur si authentifié
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Utiliser un AbortController pour gérer le timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
          
          await axios.post('http://localhost:3000/api/notifications', newNotification, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
            timeout: 5000 // Timeout de 5 secondes
          });
          
          clearTimeout(timeoutId);
          console.log('Notification envoyée au serveur avec succès');
        } catch (error: any) {
          console.error('Erreur lors de l\'envoi de la notification:', error);
          
          // Gérer les différents types d'erreurs
          if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
            console.warn("Timeout lors de l'envoi de la notification");
          } else if (error.response) {
            console.warn(`Erreur ${error.response.status} lors de l'envoi de la notification`);
          }
          
          // La notification reste uniquement dans l'UI locale
          console.warn('La notification reste uniquement dans l\'UI locale');
        }
      }
    }
    // Dans tous les cas, la notification a été ajoutée à l'état local
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    showToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
