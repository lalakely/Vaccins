import React, { useState, useEffect } from 'react';
import { WifiIcon, WifiOffIcon } from 'lucide-react';
import { apiAvailable, API_BASE_URL, checkApiAvailability } from '../../config/api';

interface ApiConnectionStatusProps {
  className?: string;
}

const ApiConnectionStatus: React.FC<ApiConnectionStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean>(apiAvailable);
  const [serverAddress, setServerAddress] = useState<string>(API_BASE_URL);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Vérifier l'état de la connexion périodiquement
  useEffect(() => {
    const checkConnection = async () => {
      const available = await checkApiAvailability();
      setIsConnected(available);
      setServerAddress(API_BASE_URL);
    };

    // Vérifier immédiatement au chargement
    checkConnection();

    // Puis vérifier toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`flex items-center gap-1 cursor-pointer ${className}`}
      onClick={() => setShowDetails(!showDetails)}
      title={isConnected ? "Connecté au serveur API" : "Non connecté au serveur API"}
    >
      {isConnected ? (
        <WifiIcon className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOffIcon className="h-4 w-4 text-red-500" />
      )}
      
      {showDetails && (
        <div className="text-xs">
          {isConnected ? (
            <span className="text-green-500">API: {serverAddress}</span>
          ) : (
            <span className="text-red-500">API non disponible</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiConnectionStatus;
