import React, { useState, useEffect } from 'react';
import { useNotification, Notification } from '../../contexts/NotificationContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { notifications } = useNotification();
  const [toasts, setToasts] = useState<Notification[]>([]);

  // Surveiller les nouvelles notifications non lues pour les afficher comme toasts
  useEffect(() => {
    // Filtrer les notifications récentes non lues
    const recentNotifications = notifications
      .filter(notif => !notif.isRead)
      .filter(notif => {
        // Vérifier si la notification est récente (moins de 10 secondes)
        const notifTime = new Date(notif.createdAt).getTime();
        const now = Date.now();
        return now - notifTime < 10000; // 10 secondes
      })
      .slice(0, 3); // Limiter à 3 toasts à la fois
    
    // Mettre à jour les toasts avec les nouvelles notifications
    if (recentNotifications.length > 0) {
      setToasts(prev => {
        // Filtrer les toasts existants pour éviter les doublons
        const existingIds = new Set(prev.map(toast => toast.id));
        const newToasts = recentNotifications.filter(notif => !existingIds.has(notif.id));
        return [...prev, ...newToasts].slice(-5); // Limiter à 5 toasts maximum
      });
    }
  }, [notifications]);

  // Gérer la fermeture d'un toast
  const handleCloseToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 max-w-md">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          notification={toast}
          onClose={() => handleCloseToast(toast.id)}
          duration={5000} // 5 secondes avant disparition automatique
        />
      ))}
    </div>
  );
};

export default ToastContainer;
