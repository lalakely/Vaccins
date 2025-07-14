import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';

/**
 * Bouton de notification avec badge de compteur et panneau déroulant
 */
const NotificationButton: React.FC = () => {
  const { notifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Gérer l'ouverture/fermeture du panneau de notifications
  const toggleNotificationPanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Bouton de notification avec badge */}
      <button
        onClick={toggleNotificationPanel}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panneau de notifications */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
          <NotificationCenter onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
