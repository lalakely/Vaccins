import {
    XMarkIcon,
    MapPinIcon,
    UserGroupIcon,
    CheckCircleIcon,
    CursorArrowRippleIcon,
    TrashIcon
  } from "@heroicons/react/24/solid";
  import { useState } from "react";
  
  function FokotanyPopup({ fokotany, onClose }) {
    const [loading, setLoading] = useState(false);
  
    if (!fokotany) return null;
  
    const handleDelete = async () => {
      if (!window.confirm(`Supprimer le fokotany "${fokotany.Nom}" ?`)) return;
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/fokotany/${fokotany.ID}`, {
          method: 'DELETE',
          headers: { "Content-Type": "application/json" },
        });
  
        if (response.ok) {
          onClose();
          window.location.reload();
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
  
          {/* En-tête avec dégradé vert/blanc */}
          <div className="rounded-t-2xl px-6 py-4 bg-gradient-to-r from-green-100 via-white to-green-100 border-b border-green-200">
            <h2 className="text-2xl font-bold text-green-700">
              Détails du fokotany
            </h2>
          </div>
  
          {/* Bouton de fermeture */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 text-green-500 hover:text-green-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
  
          {/* Contenu */}
          <div className="p-6 sm:p-8 space-y-4 text-gray-800">
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-5 w-5 text-green-500 mt-1" />
              <span><span className="font-semibold">Nom :</span> {fokotany.Nom}</span>
            </div>
  
            <div className="flex items-start gap-2">
              <CursorArrowRippleIcon className="h-5 w-5 text-green-500 mt-1" />
              <span><span className="font-semibold">px :</span> {fokotany.px}</span>
            </div>
  
            <div className="flex items-start gap-2">
              <CursorArrowRippleIcon className="h-5 w-5 text-green-500 mt-1" />
              <span><span className="font-semibold">py :</span> {fokotany.py}</span>
            </div>
  
            <div className="flex items-start gap-2">
              <UserGroupIcon className="h-5 w-5 text-green-500 mt-1" />
              <span><span className="font-semibold">Nombre total d'enfants :</span> {fokotany.nombre_enfant}</span>
            </div>
  
            <div className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1" />
              <span><span className="font-semibold">Enfants vaccinés :</span> {fokotany.nombre_enfant_vaccines}</span>
            </div>
  
            {/* Bouton de suppression */}
            <div className="pt-6">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                <TrashIcon className="h-5 w-5" />
                {loading ? "Suppression..." : "Supprimer le fokotany"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default FokotanyPopup;
  