import axios from 'axios';
import { NotificationCategory } from '../contexts/NotificationContext';

// Interface pour les données de vaccins en retard
export interface OverdueVaccine {
  id: number;
  name: string;
  description?: string;
  age_recommande?: number;
  days_overdue: number;
  delai_rappel?: number;
  date_vaccination_parent?: string;
  date_due?: string;
}

// Interface pour les enfants avec vaccins en retard
export interface ChildWithOverdueVaccines {
  enfant: {
    id: number;
    Nom: string;
    Prenom: string;
    CODE: string;
    date_naissance: string;
    Fokotany: string;
    Hameau: string;
    age_in_days: number;
  };
  overdue_vaccines: OverdueVaccine[];
}

/**
 * Service pour gérer les notifications liées aux vaccinations
 */
class VaccinationNotificationService {
  private apiUrl = 'http://localhost:3000/api';
  private token: string | null = localStorage.getItem('token');

  /**
   * Récupère la liste des enfants ayant des vaccins en retard
   * @returns Promise avec la liste des enfants et leurs vaccins en retard
   */
  async getChildrenWithOverdueVaccines(): Promise<ChildWithOverdueVaccines[]> {
    try {
      // Utiliser un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes

      const response = await axios.get(`${this.apiUrl}/children-with-overdue-vaccines`, {
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
        signal: controller.signal,
        timeout: 5000
      });

      clearTimeout(timeoutId);
      return response.data || [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des enfants avec vaccins en retard:', error);
      
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
        console.warn("Timeout lors de la récupération des enfants avec vaccins en retard");
      } else if (error.response) {
        console.warn(`Erreur ${error.response.status} lors de la récupération des enfants avec vaccins en retard`);
      }
      
      return [];
    }
  }

  /**
   * Crée les objets de notification pour les enfants ayant des vaccins en retard
   * @param childrenWithOverdueVaccines Liste des enfants avec leurs vaccins en retard
   * @returns Tableau d'objets de notification prêts à être ajoutés au contexte de notification
   */
  generateOverdueVaccineNotifications(childrenWithOverdueVaccines: ChildWithOverdueVaccines[]) {
    const notifications = [];

    for (const child of childrenWithOverdueVaccines) {
      // Créer une notification pour chaque enfant ayant des vaccins en retard
      const overdueCount = child.overdue_vaccines.length;
      const mostOverdueVaccine = [...child.overdue_vaccines].sort((a, b) => b.days_overdue - a.days_overdue)[0];
      const overdueMessage = overdueCount === 1
        ? `Le vaccin "${mostOverdueVaccine.name}" est en retard de ${mostOverdueVaccine.days_overdue} jours.`
        : `${overdueCount} vaccins sont en retard, dont "${mostOverdueVaccine.name}" (${mostOverdueVaccine.days_overdue} jours).`;
      
      notifications.push({
        title: `Vaccins en retard - ${child.enfant.Prenom} ${child.enfant.Nom}`,
        message: overdueMessage,
        type: 'warning',
        category: 'vaccination_alert' as NotificationCategory,
        actionLink: `/enfants/${child.enfant.id}`, // Lien vers la fiche de l'enfant
        entityType: 'enfant',
        entityId: child.enfant.id,
        expiresAt: this.calculateExpirationDate(7) // Expire après 7 jours
      });
    }

    return notifications;
  }

  /**
   * Calcule une date d'expiration pour une notification
   * @param daysFromNow Nombre de jours avant expiration
   * @returns Date formatée en chaîne ISO
   */
  calculateExpirationDate(daysFromNow: number): string {
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + daysFromNow);
    return expiresDate.toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Méthode statique pour calculer une date d'expiration pour une notification
   * @param daysFromNow Nombre de jours avant expiration
   * @returns Date formatée en chaîne ISO
   */
  static calculateExpirationDate(daysFromNow: number): string {
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + daysFromNow);
    return expiresDate.toISOString().slice(0, 19).replace('T', ' ');
  }
}

export default new VaccinationNotificationService();
