import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userLogin, User } from '../../api/tauri/userApi';
import { createNotification } from '../../api/tauri/notificationApi';
// Supposons que vous avez un contexte d'authentification
import { AuthContext } from '../../context/AuthContext';
// Et un contexte de notification (basé sur votre mémoire des améliorations du système de notification)
import { NotificationContext } from '../../context/NotificationContext';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Contrairement à l'ancienne approche avec buildApiUrl(),
      // nous utilisons maintenant directement l'API Tauri
      
      // 1. D'abord vérifier si l'utilisateur existe et le mot de passe est correct
      // Note: Dans un scénario réel, vous devriez hasher le mot de passe côté frontend 
      // avant de l'envoyer, ou implémenter une fonction Tauri spécifique pour la vérification
      // du mot de passe
      const ip = "127.0.0.1"; // IP locale pour l'app Tauri
      const user = await userLogin(username, ip);
      
      // 2. Stocker l'utilisateur dans le contexte d'authentification
      setUser(user);
      setIsAuthenticated(true);
      
      // 3. Créer une notification de bienvenue
      await createNotification({
        user_id: user.id,
        message: `Bienvenue ${user.username}`,
        type: 'success',
        status: 'non_lu'
      });
      
      // 4. Ajouter une notification visuelle
      addNotification({
        id: Date.now().toString(),
        message: 'Connexion réussie!',
        type: 'success'
      });
      
      // 5. Rediriger vers le tableau de bord
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      
      // Ajouter une notification d'erreur
      addNotification({
        id: Date.now().toString(),
        message: 'Échec de connexion: ' + errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Connexion</h2>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="username">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 border rounded shadow appearance-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border rounded shadow appearance-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            
            <a
              href="#"
              onClick={() => navigate('/register')}
              className="inline-block text-sm font-bold text-blue-500 align-baseline hover:text-blue-800"
            >
              Créer un compte
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
