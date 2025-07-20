import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { buildApiUrl } from '../config/api';

// Configuration de base pour tous les appels API
const DEFAULT_TIMEOUT = 5000; // 5 secondes par défaut
const MAX_RETRIES = 2; // Nombre maximum de tentatives en cas d'échec

/**
 * Configuration pour les appels API avec retry
 */
interface ApiCallConfig extends AxiosRequestConfig {
  retries?: number;
  retryDelay?: number;
  silentError?: boolean;
}

/**
 * Classe utilitaire pour les appels API avec gestion des erreurs et des timeouts
 */
class ApiService {
  /**
   * Effectue une requête GET avec gestion des timeouts et des erreurs
   * @param url URL relative de l'API (sans le domaine)
   * @param config Configuration de la requête
   * @returns Promise avec la réponse
   */
  static async get<T = any>(url: string, config: ApiCallConfig = {}): Promise<AxiosResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * Effectue une requête POST avec gestion des timeouts et des erreurs
   * @param url URL relative de l'API (sans le domaine)
   * @param data Données à envoyer
   * @param config Configuration de la requête
   * @returns Promise avec la réponse
   */
  static async post<T = any>(url: string, data?: any, config: ApiCallConfig = {}): Promise<AxiosResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * Effectue une requête PUT avec gestion des timeouts et des erreurs
   * @param url URL relative de l'API (sans le domaine)
   * @param data Données à envoyer
   * @param config Configuration de la requête
   * @returns Promise avec la réponse
   */
  static async put<T = any>(url: string, data?: any, config: ApiCallConfig = {}): Promise<AxiosResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * Effectue une requête PATCH avec gestion des timeouts et des erreurs
   * @param url URL relative de l'API (sans le domaine)
   * @param data Données à envoyer
   * @param config Configuration de la requête
   * @returns Promise avec la réponse
   */
  static async patch<T = any>(url: string, data?: any, config: ApiCallConfig = {}): Promise<AxiosResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  /**
   * Effectue une requête DELETE avec gestion des timeouts et des erreurs
   * @param url URL relative de l'API (sans le domaine)
   * @param config Configuration de la requête
   * @returns Promise avec la réponse
   */
  static async delete<T = any>(url: string, config: ApiCallConfig = {}): Promise<AxiosResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Méthode générique pour effectuer une requête HTTP avec gestion des timeouts, des erreurs et des retries
   * @param method Méthode HTTP (GET, POST, PUT, DELETE)
   * @param url URL relative de l'API (sans le domaine)
   * @param data Données à envoyer (pour POST, PUT, PATCH)
   * @param config Configuration de la requête
   * @returns Promise avec la réponse
   */
  private static async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config: ApiCallConfig = {}
  ): Promise<AxiosResponse<T>> {
    // Paramètres par défaut
    const retries = config.retries !== undefined ? config.retries : MAX_RETRIES;
    const retryDelay = config.retryDelay || 1000; // 1 seconde par défaut
    const timeout = config.timeout || DEFAULT_TIMEOUT;
    const silentError = config.silentError || false;
    
    // Ajouter le token d'authentification s'il existe
    const token = localStorage.getItem('token');
    const headers = {
      ...config.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    // Créer un AbortController pour gérer le timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Configuration de la requête
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method,
      url: buildApiUrl(url),
      headers,
      signal: controller.signal,
      timeout,
      data
    };

    try {
      // Effectuer la requête
      const response = await axios(requestConfig);
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Gérer les différents types d'erreurs
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
        console.warn(`Timeout lors de la requête ${method} ${url}`);
        
        // Retry si des tentatives sont encore disponibles
        if (retries > 0) {
          console.log(`Nouvelle tentative (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}) dans ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return this.request<T>(method, url, data, { ...config, retries: retries - 1 });
        }
      } else if (error.response) {
        // Erreur avec réponse du serveur (400, 404, 500, etc.)
        if (!silentError) {
          console.warn(`Erreur ${error.response.status} lors de la requête ${method} ${url}`);
          
          // Si c'est une erreur 5xx (erreur serveur), on peut retry
          if (error.response.status >= 500 && retries > 0) {
            console.log(`Nouvelle tentative (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}) dans ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return this.request<T>(method, url, data, { ...config, retries: retries - 1 });
          }
        }
      } else {
        // Erreur réseau ou autre
        if (!silentError) {
          console.error(`Erreur lors de la requête ${method} ${url}:`, error.message);
        }
      }
      
      // Propager l'erreur
      throw error;
    }
  }
}

export default ApiService;
