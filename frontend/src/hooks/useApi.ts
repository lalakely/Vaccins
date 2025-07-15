import { useState, useCallback } from 'react';
import ApiService from '../utils/apiService';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Interface étendant AxiosRequestConfig pour inclure nos propriétés personnalisées
 */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  retries?: number;
  retryDelay?: number;
  silentError?: boolean;
}

/**
 * Interface pour les options du hook useApi
 */
interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: AxiosError) => void;
  autoExecute?: boolean;
  initialData?: any;
  fallbackData?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  silentError?: boolean;
}

/**
 * Interface pour le résultat du hook useApi
 */
interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: AxiosError | null;
  apiAvailable: boolean;
  execute: (...args: any[]) => Promise<AxiosResponse<T> | null>;
  reset: () => void;
}

/**
 * Hook personnalisé pour effectuer des appels API avec gestion des états de chargement, des erreurs et des timeouts
 * @param method Méthode HTTP (get, post, put, patch, delete)
 * @param url URL relative de l'API (sans le domaine)
 * @param options Options pour l'appel API
 * @returns Objet avec les données, l'état de chargement, les erreurs et les fonctions d'exécution
 */
function useApi<T = any>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [isLoading, setIsLoading] = useState<boolean>(options.autoExecute || false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean>(true);

  /**
   * Exécute l'appel API avec les paramètres spécifiés
   * @param args Arguments à passer à la méthode API (data pour POST/PUT/PATCH, config pour GET/DELETE)
   * @returns Promise avec la réponse ou null en cas d'erreur
   */
  const execute = useCallback(async (...args: any[]): Promise<AxiosResponse<T> | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      // Configuration de la requête
      const config: ExtendedAxiosRequestConfig = {
        timeout: options.timeout,
        retries: options.retries,
        retryDelay: options.retryDelay,
        silentError: options.silentError
      };

      // Exécuter la requête en fonction de la méthode
      switch (method) {
        case 'get':
          response = await ApiService.get<T>(url, { ...config, ...(args[0] || {}) });
          break;
        case 'delete':
          response = await ApiService.delete<T>(url, { ...config, ...(args[0] || {}) });
          break;
        case 'post':
          response = await ApiService.post<T>(url, args[0], { ...config, ...(args[1] || {}) });
          break;
        case 'put':
          response = await ApiService.put<T>(url, args[0], { ...config, ...(args[1] || {}) });
          break;
        case 'patch':
          response = await ApiService.patch<T>(url, args[0], { ...config, ...(args[1] || {}) });
          break;
        default:
          throw new Error(`Méthode HTTP non supportée: ${method}`);
      }

      // Mise à jour des états
      setData(response.data);
      setApiAvailable(true);
      
      // Callback de succès
      if (options.onSuccess) {
        options.onSuccess(response.data);
      }

      return response;
    } catch (err: any) {
      setError(err);
      
      // Si c'est une erreur de timeout ou une erreur serveur, on considère que l'API n'est pas disponible
      if (
        err.code === 'ECONNABORTED' || 
        err.name === 'AbortError' || 
        (err.response && err.response.status >= 500)
      ) {
        setApiAvailable(false);
        
        // Utiliser les données de fallback si disponibles
        if (options.fallbackData !== undefined) {
          setData(options.fallbackData);
        }
      }
      
      // Callback d'erreur
      if (options.onError) {
        options.onError(err);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [method, url, options]);

  /**
   * Réinitialise les états du hook
   */
  const reset = useCallback(() => {
    setData(options.initialData || null);
    setIsLoading(false);
    setError(null);
    setApiAvailable(true);
  }, [options.initialData]);

  // Exécution automatique si autoExecute est true
  useState(() => {
    if (options.autoExecute) {
      execute();
    }
  });

  return {
    data,
    isLoading,
    error,
    apiAvailable,
    execute,
    reset
  };
}

export default useApi;
