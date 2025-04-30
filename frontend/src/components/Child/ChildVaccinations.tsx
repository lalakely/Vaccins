import { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  ShieldCheckIcon,
  ClockIcon,
  InboxIcon,
} from "@heroicons/react/24/solid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ChildVaccinations({ enfantId }) {
  const [vaccines, setVaccines] = useState([]);
  const [selectedVaccine, setSelectedVaccine] = useState("");
  const [availableVaccines, setAvailableVaccines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCombobox, setShowCombobox] = useState(false);

  useEffect(() => {
    const fetchVaccines = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/api/vaccins", {
          cache: "no-store",
        });
        const data = await response.json();
        setAvailableVaccines(data);
      } catch (error) {
        setError("Erreur lors du chargement des vaccins");
        console.error("Error fetching vaccines:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVaccines();
  }, []);

  useEffect(() => {
    const fetchChildVaccinations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/vaccinations?enfant_id=${enfantId}`,
          {
            cache: "no-store",
          }
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la requête au serveur");
        }
        const data = await response.json();
        setVaccines(data); // Les données incluent maintenant le champ "name"
      } catch (error) {
        setError("Erreur lors du chargement des vaccinations");
        console.error("Error fetching child vaccinations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (enfantId) {
      fetchChildVaccinations();
    }
  }, [enfantId]);

  const handleAddVaccine = async () => {
    if (!selectedVaccine || !enfantId) {
      console.error("Vaccine or enfantId missing");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/vaccinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enfant_id: enfantId,
          vaccin_id: selectedVaccine,
          date_vaccination: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l’ajout du vaccin");
      }

      const newVaccination = await response.json(); // Contient maintenant toutes les données, y compris "name"
      setVaccines((prevVaccines) => [...prevVaccines, newVaccination]);
      setSelectedVaccine("");
      setShowCombobox(false);
    } catch (error) {
      console.error("Error adding vaccination:", error);
      setError("Erreur lors de l’ajout du vaccin");
    }
  };

  const handleDeleteVaccine = async (vaccineId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/vaccinations/${vaccineId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setVaccines((prevVaccines) =>
        prevVaccines.filter((vaccine) => vaccine.id !== vaccineId)
      );
    } catch (error) {
      console.error("Error deleting vaccination:", error);
      setError("Erreur lors de la suppression de la vaccination");
    }
  };

  const handleCancel = () => {
    setSelectedVaccine(""); // Réinitialise la sélection
    setShowCombobox(false); // Ferme le combobox
  };

  if (!enfantId) {
    return <div className="text-red-600">Erreur : ID de l'enfant non spécifié</div>;
  }

  if (isLoading) {
    return <div className="text-gray-600 animate-pulse">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600 font-semibold">{error}</div>;
  }

  return (
    <div
      className="bg-gray-50 p-6 rounded-lg shadow-lg max-w-3xl w-full"
      style={{ minWidth: "400px" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldCheckIcon className="h-6 w-6 text-gray-600" /> Vaccinations
        </h2>
        {!showCombobox && (
          <button
            onClick={() => setShowCombobox(true)}
            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-md"
          >
            <PlusIcon className="h-5 w-5" /> Ajouter
          </button>
        )}
      </div>

      {/* Affichage des vaccins ou message "Aucun vaccin" */}
      {vaccines.length === 0 ? (
        <div className="text-center py-6">
          <InboxIcon className="h-12 w-12 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-600 text-lg">
            Aucun vaccin prescrit pour cet enfant
          </p>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vaccines.map((vaccine) => (
              <div
                key={vaccine.id}
                className="relative bg-white p-4 rounded-lg shadow-md group hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-600" />{" "}
                  {vaccine.name}
                </h3>
                <p className="text-gray-600 flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  Date: {new Date(vaccine.date_vaccination).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleDeleteVaccine(vaccine.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Supprimer ce vaccin"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combobox et boutons conditionnels */}
      {showCombobox && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Sélectionnez un vaccin
          </h3>
          <Select
            onValueChange={(value) => setSelectedVaccine(value)}
            value={selectedVaccine}
          >
            <SelectTrigger className="bg-white text-gray-900 border-gray-300 hover:border-gray-600 w-full shadow-sm focus:ring-2 focus:ring-gray-400">
              <SelectValue placeholder="Sélectionnez un vaccin" className="text-gray-500" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300 text-gray-900">
              {availableVaccines.map((vaccine) => (
                <SelectItem
                  key={vaccine.id}
                  value={vaccine.id}
                  className="text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-200 focus:text-gray-900 transition-colors"
                >
                  {vaccine.Nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedVaccine && (
            <div className="mt-4 flex gap-4">
              <button
                onClick={handleAddVaccine}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md"
              >
                <PlusIcon className="h-5 w-5" /> Confirmer l'ajout
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChildVaccinations;