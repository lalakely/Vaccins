// Configuration centralisée pour les URL d'API
// Utilise les variables d'environnement définies dans .env
// Adapté pour fonctionner avec Tauri et le déploiement VPS
import axios from 'axios';

// Le port sur lequel le serveur backend écoute (depuis .env ou par défaut 3000)
export const SERVER_PORT = parseInt(import.meta.env.VITE_API_PORT || '3000', 10);

// Détection si l'application est exécutée dans Tauri
export const isTauri = window.__TAURI__ !== undefined;

// Indique si on est en mode production
export const isProduction = import.meta.env.PROD;


// L'URL de base pour toutes les requêtes API
const ENV_API_URL = import.meta.env.VITE_API_BASE_URL;
console.log('[API Debug] import.meta.env.VITE_API_BASE_URL:', ENV_API_URL);
console.log('[API Debug] import.meta.env.MODE:', import.meta.env.MODE);

// 2. Construction de l'URL par défaut (sensible au protocole et à l'environnement)
const getProtocol = () => {
  if (isTauri) return 'http:';
  // En production web, on FORCE https si on est sur un domaine public
  if (isProduction && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return 'https:';
  }
  return window.location.protocol;
};

// Marqueur de version pour vérifier le cache (v3 - HTTPS Forcé)
console.log('[API Config] Version du code chargée: ' + new Date().toISOString());

const DEFAULT_API_URL = isTauri
  ? `http://localhost:${SERVER_PORT}`
  : `${getProtocol()}//${isProduction && !window.location.hostname.includes('localhost') ? 'api.' : ''}${window.location.hostname}${isProduction ? '' : `:${SERVER_PORT}`}`;

// L'URL finale utilisée par l'application
export let API_BASE_URL = ENV_API_URL || DEFAULT_API_URL;

// SÉCURITÉ ABSOLUE : Forcer le sous-domaine 'api.' pour la production sur csb.madahoff.com
if (isProduction && window.location.hostname === 'csb.madahoff.com') {
  if (!API_BASE_URL.includes('api.csb.madahoff.com')) {
    console.log('[API Config] FORÇAGE DU SOUS-DOMAINE API POUR TRAEFIK');
    API_BASE_URL = 'https://api.csb.madahoff.com';
  }
}

// Sécurité supplémentaire : Forcer HTTPS sur l'URL finale en production web
if (isProduction && API_BASE_URL.startsWith('http://') && !API_BASE_URL.includes('localhost') && !API_BASE_URL.includes('127.0.0.1')) {
  console.log('[API Config] Correction de l\'URL non-sécurisée vers HTTPS');
  API_BASE_URL = API_BASE_URL.replace('http://', 'https://');
}

// Indique si l'API est disponible
export let apiAvailable = true;

// Fonction pour mettre à jour l'URL de base avec l'IP du serveur (utile en local uniquement)
export const updateServerIP = async () => {
  // En production ou si une URL est déjà fournie, on ne cherche pas à détecter l'IP
  if (isProduction || ENV_API_URL) {
    console.log(`[API Config] Mode ${isProduction ? 'Production' : 'Environnement'} détecté.`);
    console.log(`[API Config] Utilisation de l'URL: ${API_BASE_URL}`);
    return;
  }

  try {
    // Si on est dans Tauri, on tente de se connecter à localhost
    if (isTauri) {
      API_BASE_URL = `http://localhost:${SERVER_PORT}`;
      console.log(`Application Tauri détectée, utilisation de l'URL API: ${API_BASE_URL}`);

      // Vérifier que le serveur est bien disponible
      try {
        await axios.get(`${API_BASE_URL}/api/server-info`, { timeout: 3000 });
        apiAvailable = true;
        return;
      } catch (err) {
        console.log('Serveur backend pas encore prêt, nouvelle tentative dans 2 secondes...');
        setTimeout(updateServerIP, 2000);
        return;
      }
    }

    // Pour le mode web local, essayer d'abord avec l'IP actuelle du navigateur
    try {
      const response = await axios.get(`https://${window.location.hostname}:${SERVER_PORT}/api/server-info`, {
        timeout: 2000
      });

      if (response.data) {
        API_BASE_URL = `https://${window.location.hostname}:${SERVER_PORT}`;
        apiAvailable = true;
        console.log(`API URL confirmée: ${API_BASE_URL}`);
        return;
      }
    } catch (initialError) {
      console.log('Tentative avec hostname échouée, essai avec localhost...');
    }

    // Fallback sur localhost
    try {
      const fallbackResponse = await axios.get(`http://localhost:${SERVER_PORT}/api/server-info`, {
        timeout: 2000
      });

      if (fallbackResponse.data) {
        API_BASE_URL = `http://localhost:${SERVER_PORT}`;
        apiAvailable = true;
        console.log(`API URL mise à jour via localhost: ${API_BASE_URL}`);
        return;
      }
    } catch (fallbackError) {
      console.log('Tentative avec localhost échouée');
    }

    apiAvailable = false;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'URL API:', error);
    apiAvailable = false;
  }
};

// Exécuter la détection de l'IP au chargement
updateServerIP();

// Fonction utilitaire pour construire des URL d'API
export const buildApiUrl = (endpoint: string): string => {
  // S'assurer que l'endpoint commence par un slash si ce n'est pas déjà le cas
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
};

// Fonction pour vérifier si l'API est disponible
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_BASE_URL}/api/server-info`, { timeout: 3000 });
    apiAvailable = true;
    return true;
  } catch (error) {
    apiAvailable = false;
    return false;
  }
};

// Écouter les événements Tauri liés au backend
export const listenToBackendEvents = () => {
  if (isTauri && window.__TAURI__?.event) {
    window.__TAURI__.event.listen('backend-error', (event) => {
      console.error('Erreur backend reçue:', event);
      // Vous pouvez ajouter ici une notification pour l'utilisateur
    });
  }
};

// Initialiser les écouteurs d'événements si on est dans Tauri
if (isTauri) {
  listenToBackendEvents();
}
console.log('API_BASE_URL:', API_BASE_URL); console.log('buildApiUrl("api/users/register"):', buildApiUrl('api/users/register'));
