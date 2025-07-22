import { useState } from "react";
import { PencilIcon, MapIcon } from "@heroicons/react/24/solid";
import { buildApiUrl } from "../../config/api";
import useNotificationService from "../../hooks/useNotificationService";
import LocationMap from "../shared/LocationMap";

interface EditHameauProps {
  hameau: {
    id?: number;
    ID?: number;
    Nom: string;
    px: number;
    py: number;
    nombre_personne?: number;
    [key: string]: any;
  };
  onEditSuccess: () => void;
}

function EditHameau({ hameau, onEditSuccess }: EditHameauProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Nom: hameau.Nom,
    px: hameau.px,
    py: hameau.py,
    nombre_personne: hameau.nombre_personne || 0
  });
  
  // Position pour la carte - conversion des coordonnées en nombres
  const initialPosition: [number, number] = [Number(hameau.py), Number(hameau.px)];
  const { showSuccess, showError } = useNotificationService();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'px' || name === 'py' || name === 'nombre_personne' 
        ? parseFloat(value) || 0 
        : value
    }));
  };
  
  // Handler pour les changements de position sur la carte
  const handlePositionChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      py: lat,
      px: lng
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hameauId = hameau.ID || hameau.id;
      
      const response = await fetch(buildApiUrl(`/api/hameau/${hameauId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess('Hameau mis à jour', 'Les informations du hameau ont été modifiées avec succès.');
        onEditSuccess();
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        showError('Erreur de mise à jour', errorData.message || 'Impossible de mettre à jour le hameau.');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showError('Erreur de mise à jour', 'Une erreur s\'est produite lors de la mise à jour du hameau.');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors rounded-full"
      >
        <PencilIcon className="h-5 w-5" />
        Modifier
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-700 flex items-center gap-2">
        <PencilIcon className="h-5 w-5 text-blue-500" />
        Modifier le hameau
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Nom du hameau
          </label>
          <input
            type="text"
            name="Nom"
            value={formData.Nom}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-200 bg-white rounded focus:ring-blue-400 focus:border-blue-400 text-gray-800"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Nombre d'habitants
          </label>
          <input
            type="number"
            name="nombre_personne"
            value={formData.nombre_personne}
            onChange={handleChange}
            className="w-full p-2 border border-gray-200 bg-white rounded focus:ring-blue-400 focus:border-blue-400 text-gray-800"
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapIcon className="h-5 w-5 text-blue-500" />
          <h4 className="text-sm font-medium text-gray-700">Position sur la carte</h4>
        </div>
        
        <div className="mb-3">
          <LocationMap 
            initialPosition={initialPosition} 
            height="300px" 
            onPositionChange={handlePositionChange} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Longitude (X)
            </label>
            <input
              type="text"
              name="px"
              value={formData.px}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-200 bg-white/70 rounded focus:ring-blue-400 focus:border-blue-400 text-gray-800"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Latitude (Y)
            </label>
            <input
              type="text"
              name="py"
              value={formData.py}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-200 bg-white/70 rounded focus:ring-blue-400 focus:border-blue-400 text-gray-800"
              readOnly
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}

export default EditHameau;
