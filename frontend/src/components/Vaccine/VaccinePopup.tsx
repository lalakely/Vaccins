import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  InformationCircleIcon,
  ClipboardDocumentListIcon,
  TrashIcon
} from "@heroicons/react/24/solid";
import { useState } from "react";

function VaccinePopup({ vaccine, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!vaccine) return null;

  const handleDelete = async () => {
   
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/vaccins/${vaccine.id}`, {
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) { 
        onClose(); // Fermer la popup après suppression
        window.location.reload()
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Échec de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-xl bg-white rounded-2xl shadow-2xl">
        
        {/* En-tête avec dégradé rouge/blanc */}
        <div className="rounded-t-2xl px-6 py-4 bg-gradient-to-r from-red-100 via-white to-red-100 border-b border-red-200">
          <h2 className="text-2xl font-bold text-red-700">
            Détails du vaccin
          </h2>
        </div>

        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Contenu */}
        <div className="p-6 sm:p-8 space-y-4 text-gray-800">
          <div className="flex items-start gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-red-500 mt-1" />
            <span><span className="font-semibold">Nom :</span> {vaccine.Nom}</span>
          </div>

          <div className="flex items-start gap-2">
            <ClockIcon className="h-5 w-5 text-red-500 mt-1" />
            <span><span className="font-semibold">Durée :</span> {vaccine.Duree} jours</span>
          </div>

          <div className="flex items-start gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-red-500 mt-1" />
            <span><span className="font-semibold">Arrivée :</span> {new Date(vaccine.Date_arrivee).toLocaleDateString()}</span>
          </div>

          <div className="flex items-start gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-red-500 mt-1" />
            <span><span className="font-semibold">Péremption :</span> {new Date(vaccine.Date_peremption).toLocaleDateString()}</span>
          </div>

          <div className="flex items-start gap-2">
            <InformationCircleIcon className="h-5 w-5 text-red-500 mt-1" />
            <span><span className="font-semibold">Description :</span> {vaccine.Description}</span>
          </div>

          {/* Bouton de suppression */}
          <div className="pt-6">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
            >
              <TrashIcon className="h-5 w-5" />
              {loading ? "Suppression..." : "Supprimer le vaccin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VaccinePopup;
