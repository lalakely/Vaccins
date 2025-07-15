import { useEffect, useRef } from 'react';
import { useNotification, NotificationType, NotificationCategory } from '../../contexts/NotificationContext';
import VaccinationNotificationService from '../../services/VaccinationNotificationService';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Composant pour gérer les notifications de vaccins en retard
 * Ce composant n'affiche rien, il effectue uniquement des vérifications en arrière-plan
 */
const VaccinNotificationManager: React.FC = () => {
  console.log('VaccinNotificationManager - Initialisation du composant');
  const { addNotification } = useNotification();
  const { isAuthenticated } = useAuth();
  console.log('VaccinNotificationManager - État d\'authentification:', isAuthenticated);
  const notificationsSent = useRef<Set<string>>(new Set());
  
  // Fonction pour vérifier les vaccins en retard
  const checkOverdueVaccines = async () => {
    console.log('VaccinNotificationManager - Début checkOverdueVaccines');
    if (!isAuthenticated) {
      console.log('VaccinNotificationManager - Utilisateur non authentifié, arrêt de la vérification');
      return;
    }
    
    try {
      console.log('VaccinNotificationManager - Appel au service pour récupérer les enfants avec vaccins en retard');
      // Récupérer les enfants avec des vaccins en retard
      const childrenWithOverdueVaccines = await VaccinationNotificationService.getChildrenWithOverdueVaccines();
      console.log(`VaccinNotificationManager - ${childrenWithOverdueVaccines.length} enfants avec vaccins en retard trouvés`);
      
      // Si des enfants ont des vaccins en retard, générer des notifications
      if (childrenWithOverdueVaccines.length > 0) {
        console.log('VaccinNotificationManager - Génération des notifications');
        const notifications = VaccinationNotificationService.generateOverdueVaccineNotifications(childrenWithOverdueVaccines);
        console.log(`VaccinNotificationManager - ${notifications.length} notifications générées`);
        
        // Envoyer les notifications (sans dupliquer)
        notifications.forEach(notification => {
          const notificationKey = `enfant_${notification.entityId}_${new Date().toDateString()}`;
          console.log(`VaccinNotificationManager - Traitement notification pour enfant ID ${notification.entityId}`);
          console.log(`VaccinNotificationManager - Clé de notification: ${notificationKey}`);
          
          // Vérifier si cette notification a déjà été envoyée aujourd'hui
          if (!notificationsSent.current.has(notificationKey)) {
            console.log(`VaccinNotificationManager - Ajout d'une nouvelle notification: ${notification.title}`);
            // Assurer que le type est correctement typé
            addNotification({
              ...notification,
              type: notification.type as NotificationType
            });
            notificationsSent.current.add(notificationKey);
            console.log(`VaccinNotificationManager - Notification ajoutée avec succès pour ${notification.entityId}`);
          } else {
            console.log(`VaccinNotificationManager - Notification déjà envoyée aujourd'hui pour ${notification.entityId}`);
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
    console.log('VaccinNotificationManager - useEffect déclenché, isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('VaccinNotificationManager - Configuration des vérifications périodiques');
      // Vérification initiale après un court délai pour laisser le temps à l'application de se charger
      console.log('VaccinNotificationManager - Délai initial de 5 secondes avant première vérification');
      const initialTimeoutId = setTimeout(() => {
        console.log('VaccinNotificationManager - Déclenchement de la vérification initiale');
        checkOverdueVaccines();
      }, 5000);
      
      // Vérification périodique toutes les heures
      console.log('VaccinNotificationManager - Configuration de la vérification horaire');
      // Temporairement réduit à 5 minutes pour le débogage
      const intervalId = setInterval(() => {
        console.log('VaccinNotificationManager - Déclenchement de la vérification périodique');
        checkOverdueVaccines();
      }, 5 * 60 * 1000); // 5 minutes au lieu de 60 minutes
      
      // Nettoyage
      return () => {
        console.log('VaccinNotificationManager - Nettoyage des timers');
        clearTimeout(initialTimeoutId);
        clearInterval(intervalId);
      };
    } else {
      console.log('VaccinNotificationManager - Non authentifié, pas de vérification configurée');
    }
  }, [isAuthenticated]);
  
  // Déclencher une vérification immédiate au premier rendu pour débogage
  useEffect(() => {
    if (isAuthenticated) {
      console.log('VaccinNotificationManager - Vérification immédiate pour débogage');
      // Délai court pour s'assurer que tout est chargé
      setTimeout(checkOverdueVaccines, 1000);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Ce composant ne rend rien visuellement
  console.log('VaccinNotificationManager - Rendu du composant (null)');
  return null;
};

export default VaccinNotificationManager;
