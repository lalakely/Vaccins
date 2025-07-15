import React from 'react';
import { BellIcon, BellAlertIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useNotification, Notification as NotificationType } from '../../contexts/NotificationContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationCenterProps {
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, isLoading } = useNotification();

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy à HH:mm', { locale: fr });
  };

  // Fonction pour obtenir l'icône en fonction de la catégorie
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'action_feedback':
        return <CheckIcon className="h-5 w-5" />;
      case 'vaccination_alert':
        return <BellAlertIcon className="h-5 w-5" />;
      case 'statistics':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>;
      case 'system':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>;
      case 'user_activity':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>;
      default:
        return <BellIcon className="h-5 w-5" />;
    }
  };

  // Fonction pour obtenir la couleur en fonction du type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default: // info
        return 'text-blue-500';
    }
  };

  // Fonction pour fermer le panneau de notifications
  const handleClose = () => {
    if (onClose) onClose();
  };

  // Fonction pour gérer le clic sur une notification
  const handleNotificationClick = (notification: NotificationType) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionLink) {
      window.location.href = notification.actionLink;
    }
  };
  
  // Fonction pour supprimer une notification
  const handleDeleteNotification = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation(); // Empêcher la propagation du clic
    deleteNotification(notificationId);
  };
  
  // Fonction pour supprimer toutes les notifications
  const handleDeleteAllNotifications = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      deleteAllNotifications();
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg z-50 max-h-[80vh] overflow-hidden flex flex-col">
      {/* En-tête */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-primary" />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="p-1 rounded-full hover:bg-gray-100 text-blue-600 hover:text-blue-800"
              title="Marquer tout comme lu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAllNotifications}
              className="p-1 rounded-full hover:bg-gray-100 text-red-600 hover:text-red-800"
              title="Supprimer toutes les notifications"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            aria-label="Fermer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="overflow-y-auto flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BellIcon className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2">Aucune notification</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''} relative group`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 mr-3 ${getTypeColor(notification.type)}`}>
                  {getCategoryIcon(notification.category || 'default')}
                </div>
                <div className="flex-grow">
                  <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notification.title}
                  </h3>
                  <p className={`text-sm ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <button 
                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                  className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer cette notification"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
