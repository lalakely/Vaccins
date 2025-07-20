// Configuration centralisée pour les URL d'API
// Détecte automatiquement l'IP du serveur pour permettre l'accès depuis différents réseaux
import axios from 'axios';

// Le port sur lequel le serveur backend écoute
export const SERVER_PORT = 3000;

// Valeur par défaut pour l'IP du serveur (utilisée avant la détection)
// Utilise l'IP actuelle du navigateur comme point de départ
let serverIP = window.location.hostname;

// L'URL de base pour toutes les requêtes API (valeur initiale)
export let API_BASE_URL = `http://${serverIP}:${SERVER_PORT}`;

// Indique si l'API est disponible
export let apiAvailable = true;

// Fonction pour mettre à jour l'URL de base avec l'IP du serveur
export const updateServerIP = async () => {
  try {
    // Essayer d'abord avec l'IP actuelle du navigateur
    try {
      const response = await axios.get(`http://${window.location.hostname}:${SERVER_PORT}/api/server-info`, {
        timeout: 2000 // Timeout court pour ne pas bloquer trop longtemps
      });
      
      if (response.data && response.data.ip) {
        serverIP = response.data.ip;
        API_BASE_URL = `http://${serverIP}:${SERVER_PORT}`;
        apiAvailable = true;
        console.log(`API URL mise à jour avec succès: ${API_BASE_URL}`);
        return;
      }
    } catch (initialError) {
      console.log('Tentative avec hostname échouée, essai avec IP alternative...');
    }
    
    // Si la première tentative échoue, essayer avec localhost
    try {
      const fallbackResponse = await axios.get(`http://localhost:${SERVER_PORT}/api/server-info`, {
        timeout: 2000
      });
      
      if (fallbackResponse.data && fallbackResponse.data.ip) {
        serverIP = fallbackResponse.data.ip;
        API_BASE_URL = `http://${serverIP}:${SERVER_PORT}`;
        apiAvailable = true;
        console.log(`API URL mise à jour via localhost: ${API_BASE_URL}`);
        return;
      }
    } catch (fallbackError) {
      console.log('Tentative avec localhost échouée');
    }
    
    // Si on arrive ici, les deux tentatives ont échoué
    console.error('Impossible de récupérer l\'IP du serveur après plusieurs tentatives');
    console.log('Utilisation de l\'IP par défaut:', serverIP);
    apiAvailable = false;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'IP du serveur:', error);
    console.log('Utilisation de l\'IP par défaut:', serverIP);
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
