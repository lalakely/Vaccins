import { useEffect, useRef } from 'react';
import { useNotification, NotificationType, NotificationCategory } from '../../contexts/NotificationContext';
import VaccinationNotificationService from '../../services/VaccinationNotificationService';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Composant pour gérer les notifications de vaccins en retard
 * Ce composant n'affiche rien, il effectue uniquement des vérifications en arrière-plan
 */
const VaccinNotificationManager: React.FC = () => {
  const { addNotification } = useNotification();
  const { isAuthenticated } = useAuth();
  const notificationsSent = useRef<Set<string>>(new Set());
  
  // Fonction pour vérifier les vaccins en retard
  const checkOverdueVaccines = async () => {
    if (!isAuthenticated) return;
    
    try {
      // Récupérer les enfants avec des vaccins en retard
      const childrenWithOverdueVaccines = await VaccinationNotificationService.getChildrenWithOverdueVaccines();
      
      // Si des enfants ont des vaccins en retard, générer des notifications
      if (childrenWithOverdueVaccines.length > 0) {
        const notifications = VaccinationNotificationService.generateOverdueVaccineNotifications(childrenWithOverdueVaccines);
        
        // Envoyer les notifications (sans dupliquer)
        notifications.forEach(notification => {
          const notificationKey = `enfant_${notification.entityId}_${new Date().toDateString()}`;
          
          // Vérifier si cette notification a déjà été envoyée aujourd'hui
          if (!notificationsSent.current.has(notificationKey)) {
            // Assurer que le type est correctement typé
            addNotification({
              ...notification,
              type: notification.type as NotificationType
            });
            notificationsSent.current.add(notificationKey);
          }
        });

        // Ajouter une notification résumée si plusieurs enfants ont des vaccins en retard
        if (childrenWithOverdueVaccines.length > 1) {
          const summaryKey = `summary_overdue_${new Date().toDateString()}`;
          
          if (!notificationsSent.current.has(summaryKey)) {
            const totalOverdueVaccines = childrenWithOverdueVaccines.reduce(
              (sum, child) => sum + child.overdue_vaccines.length, 
              0
            );
            
            addNotification({
              title: 'Alerte vaccins en retard',
              message: `${childrenWithOverdueVaccines.length} enfants ont un total de ${totalOverdueVaccines} vaccins en retard.`,
              type: 'warning' as NotificationType,
              category: 'vaccination_alert' as NotificationCategory,
              actionLink: '/enfants', // Lien vers la liste des enfants
              expiresAt: VaccinationNotificationService.calculateExpirationDate(7)
            });
            
            notificationsSent.current.add(summaryKey);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des vaccins en retard:', error);
    }
  };

  // Effet pour vérifier les vaccins en retard au chargement et périodiquement
  useEffect(() => {
    if (isAuthenticated) {
      // Vérification initiale après un court délai pour laisser le temps à l'application de se charger
      const initialTimeoutId = setTimeout(() => {
        checkOverdueVaccines();
      }, 5000);
      
      // Vérification périodique toutes les heures
      const intervalId = setInterval(checkOverdueVaccines, 60 * 60 * 1000);
      
      // Nettoyage
      return () => {
        clearTimeout(initialTimeoutId);
        clearInterval(intervalId);
      };
    }
  }, [isAuthenticated]);
  
  // Ce composant ne rend rien visuellement
  return null;
};

export default VaccinNotificationManager;
