import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../../contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';

/**
 * Bouton de notification avec badge de compteur et panneau déroulant
 */
const NotificationButton: React.FC = () => {
  const { notifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Gérer l'ouverture/fermeture du panneau de notifications
  const openNotificationPanel = () => {
    setIsOpen(true);
  };
  
  // Fermer le panneau quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && 
          notificationPanelRef.current && 
          buttonRef.current &&
          !notificationPanelRef.current.contains(event.target as Node) &&
          !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Bouton de notification avec badge et animation */}
      <button
        ref={buttonRef}
        onClick={openNotificationPanel}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 shadow-md hover:shadow-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
        aria-label="Notifications"
      >
        <div className="relative">
          {unreadCount > 0 ? (
            <BellAlertIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          ) : (
            <BellIcon className="h-6 w-6 text-gray-600 hover:text-indigo-600 transition-colors" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Panneau de notifications */}
      {isOpen && (
        <div 
          ref={notificationPanelRef}
          className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-[80vh] overflow-y-auto"
        >
          <NotificationCenter onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
