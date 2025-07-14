import { useCallback } from 'react';
import { useNotification, NotificationType, NotificationCategory } from '../contexts/NotificationContext';

/**
 * Hook personnalisé pour faciliter l'utilisation des notifications dans les composants
 */
export const useNotificationService = () => {
  const { showToast } = useNotification();

  /**
   * Affiche une notification de succès
   */
  const showSuccess = useCallback((title: string, message: string, options?: {
    actionLink?: string;
    entityType?: string;
    entityId?: number;
  }) => {
    showToast({
      title,
      message,
      type: 'success',
      category: 'action_feedback',
      ...options
    });
  }, [showToast]);

  /**
   * Affiche une notification d'erreur
   */
  const showError = useCallback((title: string, message: string, options?: {
    actionLink?: string;
    entityType?: string;
    entityId?: number;
  }) => {
    showToast({
      title,
      message,
      type: 'error',
      category: 'action_feedback',
      ...options
    });
  }, [showToast]);

  /**
   * Affiche une notification d'avertissement
   */
  const showWarning = useCallback((title: string, message: string, options?: {
    actionLink?: string;
    entityType?: string;
    entityId?: number;
    category?: NotificationCategory;
  }) => {
    showToast({
      title,
      message,
      type: 'warning',
      category: options?.category || 'action_feedback',
      actionLink: options?.actionLink,
      entityType: options?.entityType,
      entityId: options?.entityId
    });
  }, [showToast]);

  /**
   * Affiche une notification d'information
   */
  const showInfo = useCallback((title: string, message: string, options?: {
    actionLink?: string;
    entityType?: string;
    entityId?: number;
    category?: NotificationCategory;
  }) => {
    showToast({
      title,
      message,
      type: 'info',
      category: options?.category || 'system',
      actionLink: options?.actionLink,
      entityType: options?.entityType,
      entityId: options?.entityId
    });
  }, [showToast]);

  /**
   * Affiche une notification pour une alerte de vaccination
   */
  const showVaccinationAlert = useCallback((title: string, message: string, options?: {
    actionLink?: string;
    entityType?: string;
    entityId?: number;
    type?: NotificationType;
  }) => {
    showToast({
      title,
      message,
      type: options?.type || 'warning',
      category: 'vaccination_alert',
      actionLink: options?.actionLink,
      entityType: options?.entityType,
      entityId: options?.entityId
    });
  }, [showToast]);

  /**
   * Affiche une notification pour les statistiques
   */
  const showStatisticsNotification = useCallback((title: string, message: string, options?: {
    actionLink?: string;
    entityType?: string;
    entityId?: number;
    type?: NotificationType;
  }) => {
    showToast({
      title,
      message,
      type: options?.type || 'info',
      category: 'statistics',
      actionLink: options?.actionLink,
      entityType: options?.entityType,
      entityId: options?.entityId
    });
  }, [showToast]);

  /**
   * Affiche une notification pour l'activité utilisateur
   */
  const showUserActivityNotification = useCallback((title: string, message: string, options?: {
    actionLink?: string;
    entityType?: string;
    entityId?: number;
    type?: NotificationType;
  }) => {
    showToast({
      title,
      message,
      type: options?.type || 'info',
      category: 'user_activity',
      actionLink: options?.actionLink,
      entityType: options?.entityType,
      entityId: options?.entityId
    });
  }, [showToast]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showVaccinationAlert,
    showStatisticsNotification,
    showUserActivityNotification
  };
};

export default useNotificationService;
