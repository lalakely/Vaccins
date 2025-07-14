import React, { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Notification } from '../../contexts/NotificationContext';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number; // Durée en millisecondes avant disparition automatique
}

const Toast: React.FC<ToastProps> = ({ notification, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Détermine la classe CSS en fonction du type de notification
  const getTypeClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      default: // info
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };

  // Détermine l'icône en fonction du type de notification
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default: // info
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  // Détermine la classe CSS pour la barre de progression
  const getProgressBarClass = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default: // info
        return 'bg-blue-500';
    }
  };

  // Gère la fermeture du toast
  const handleClose = () => {
    setIsVisible(false);
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Animation de fermeture
    setTimeout(() => {
      onClose();
    }, 300); // Durée de l'animation de fermeture
  };

  // Effet pour gérer la barre de progression et la fermeture automatique
  useEffect(() => {
    if (duration > 0) {
      const steps = 100;
      const stepDuration = duration / steps;
      
      const id = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress <= 0) {
            clearInterval(id);
            handleClose();
            return 0;
          }
          return prevProgress - 100 / steps;
        });
      }, stepDuration);
      
      setIntervalId(id);
      
      return () => {
        clearInterval(id);
      };
    }
  }, [duration]);

  return (
    <div 
      className={`${getTypeClasses()} border-l-4 p-4 rounded-r-lg shadow-md mb-3 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      } flex flex-col max-w-md`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">{notification.title}</h3>
            <div className="mt-1 text-sm">
              {notification.message}
            </div>
            {notification.actionLink && (
              <a 
                href={notification.actionLink} 
                className="mt-2 inline-block text-sm font-medium underline hover:text-opacity-80"
              >
                Voir plus
              </a>
            )}
          </div>
        </div>
        <button
          type="button"
          className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          onClick={handleClose}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Barre de progression */}
      {duration > 0 && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div
            className={`${getProgressBarClass()} h-1 rounded-full transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Toast;
