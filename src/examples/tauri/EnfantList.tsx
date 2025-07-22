import React, { useState, useEffect, useContext, useRef } from 'react';
import { getAllEnfants, deleteEnfant, Enfant } from '../../api/tauri/enfantApi';
import { getFokotanyById } from '../../api/tauri/fokotanyApi';
import { getHameauById } from '../../api/tauri/hameauApi';
import { getVaccinationsByEnfant } from '../../api/tauri/vaccinationApi';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import { AuthContext } from '../../context/AuthContext';

const EnfantList: React.FC = () => {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInfo, setLocationInfo] = useState<Record<number, string>>({});
  const [vaccinationCounts, setVaccinationCounts] = useState<Record<number, number>>({});

  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);
  const { user } = useContext(AuthContext);
  
  // Utilisation de useRef pour éviter les notifications en boucle comme mentionné dans les mémoires
  const notificationsShown = useRef<boolean>(false);

  useEffect(() => {
    fetchEnfants();
  }, []);

  // Fonction pour charger la liste des enfants
  const fetchEnfants = async () => {
    try {
      setLoading(true);
      const data = await getAllEnfants();
      setEnfants(data);

      // Récupérer les informations de localité pour chaque enfant
      const locationData: Record<number, string> = {};
      for (const enfant of data) {
        if (enfant.id) {
          if (enfant.fokotany_id) {
            try {
              const fokotany = await getFokotanyById(enfant.fokotany_id);
              locationData[enfant.id] = fokotany.nom;
            } catch (err) {
              console.error('Erreur lors de la récupération du fokotany:', err);
            }
          } else if (enfant.hameau_id) {
            try {
              const hameau = await getHameauById(enfant.hameau_id);
              locationData[enfant.id] = hameau.nom;
            } catch (err) {
              console.error('Erreur lors de la récupération du hameau:', err);
            }
          }
        }
      }
      setLocationInfo(locationData);

      // Récupérer le nombre de vaccinations pour chaque enfant
      const vaccinData: Record<number, number> = {};
      for (const enfant of data) {
        if (enfant.id) {
          try {
            const vaccinations = await getVaccinationsByEnfant(enfant.id);
            vaccinData[enfant.id] = vaccinations.length;
          } catch (err) {
            console.error('Erreur lors de la récupération des vaccinations:', err);
          }
        }
      }
      setVaccinationCounts(vaccinData);

      // Afficher une notification une seule fois (pour éviter les boucles)
      if (!notificationsShown.current && data.length > 0) {
        addNotification({
          id: Date.now().toString(),
          message: `${data.length} enfants chargés avec succès`,
          type: 'success'
        });
        notificationsShown.current = true;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addNotification({
        id: Date.now().toString(),
        message: 'Erreur lors du chargement des enfants: ' + errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un enfant
  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enfant?')) return;
    
    try {
      await deleteEnfant(id, user?.id);
      setEnfants(enfants.filter(enfant => enfant.id !== id));
      addNotification({
        id: Date.now().toString(),
        message: 'Enfant supprimé avec succès',
        type: 'success'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addNotification({
        id: Date.now().toString(),
        message: 'Erreur lors de la suppression: ' + errorMessage,
        type: 'error'
      });
    }
  };

  // Filtrer les enfants selon la recherche
  const filteredEnfants = enfants.filter(
    (enfant) =>
      enfant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enfant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enfant.code && enfant.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calcul de l'âge en années à partir de la date de naissance
  const calculateAge = (dateOfBirth: string): string => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} an${age > 1 ? 's' : ''}`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des enfants</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/enfant/ajouter')}
        >
          Ajouter un enfant
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou code..."
          className="w-full px-4 py-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
          <button 
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
            onClick={fetchEnfants}
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">{filteredEnfants.length} enfant(s) trouvé(s)</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Code</th>
                  <th className="py-2 px-4 border-b">Nom</th>
                  <th className="py-2 px-4 border-b">Prénom</th>
                  <th className="py-2 px-4 border-b">Âge</th>
                  <th className="py-2 px-4 border-b">Sexe</th>
                  <th className="py-2 px-4 border-b">Localité</th>
                  <th className="py-2 px-4 border-b">Vaccinations</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnfants.map((enfant) => (
                  <tr key={enfant.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{enfant.code || '—'}</td>
                    <td className="py-2 px-4 border-b">{enfant.nom}</td>
                    <td className="py-2 px-4 border-b">{enfant.prenom}</td>
                    <td className="py-2 px-4 border-b">{enfant.date_naissance && calculateAge(enfant.date_naissance)}</td>
                    <td className="py-2 px-4 border-b">{enfant.sexe === 'M' ? 'Masculin' : 'Féminin'}</td>
                    <td className="py-2 px-4 border-b">{enfant.id && locationInfo[enfant.id] || '—'}</td>
                    <td className="py-2 px-4 border-b">
                      {enfant.id && vaccinationCounts[enfant.id] || 0}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                          onClick={() => navigate(`/enfant/${enfant.id}`)}
                        >
                          Voir
                        </button>
                        <button
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                          onClick={() => navigate(`/enfant/modifier/${enfant.id}`)}
                        >
                          Modifier
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                          onClick={() => enfant.id && handleDelete(enfant.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEnfants.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-gray-500">
                      Aucun enfant trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default EnfantList;
