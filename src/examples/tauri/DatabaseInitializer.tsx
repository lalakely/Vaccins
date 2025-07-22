import React, { useEffect, useState } from 'react';
import { initializeDatabase } from '../../api/tauri';

interface DatabaseInitializerProps {
  onInitialized: () => void;
  onError: (error: string) => void;
}

/**
 * Composant qui initialise la base de données SQLite locale
 * À utiliser au démarrage de l'application Tauri
 */
const DatabaseInitializer: React.FC<DatabaseInitializerProps> = ({ 
  onInitialized, 
  onError 
}) => {
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase();
        setInitializing(false);
        onInitialized();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setInitializing(false);
        onError(errorMessage);
      }
    };

    initialize();
  }, [onInitialized, onError]);

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
          <p className="text-gray-700">Initialisation de la base de données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-red-500">
          <h3>Erreur d'initialisation</h3>
          <p>{error}</p>
          <button 
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Si tout est OK, on ne rend rien car onInitialized() a été appelé
  return null;
};

export default DatabaseInitializer;
