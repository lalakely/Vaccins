import {
    XMarkIcon,
    MapIcon,
    CursorArrowRippleIcon,
    UsersIcon,
    TrashIcon
  } from "@heroicons/react/24/solid";
  import { useState } from "react";
  
  function HameauPopup({ hameau, onClose }) {
    const [loading, setLoading] = useState(false);
  
    if (!hameau) return null;
  
    const handleDelete = async () => {
      if (!window.confirm(`Supprimer l'hameau "${hameau.Nom}" ?`)) return;
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/hameaux/${hameau.id}`, {
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
  
          {/* En-tête avec dégradé bleu/blanc */}
          <div className="rounded-t-2xl px-6 py-4 bg-gradient-to-r from-blue-100 via-white to-blue-100 border-b border-blue-200">
            <h2 className="text-2xl font-bold text-blue-700">
              Détails de l'hameau
            </h2>
          </div>
  
          {/* Bouton de fermeture */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 text-blue-500 hover:text-blue-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
  
          {/* Contenu */}
          <div className="p-6 sm:p-8 space-y-4 text-gray-800">
            <div className="flex items-start gap-2">
              <MapIcon className="h-5 w-5 text-blue-500 mt-1" />
              <span><span className="font-semibold">Nom :</span> {hameau.Nom}</span>
            </div>
            <div className="flex items-start gap-2">
              <CursorArrowRippleIcon className="h-5 w-5 text-blue-500 mt-1" />
              <span><span className="font-semibold">px :</span> {hameau.px}</span>
            </div>
            <div className="flex items-start gap-2">
              <CursorArrowRippleIcon className="h-5 w-5 text-blue-500 mt-1" />
              <span><span className="font-semibold">py :</span> {hameau.py}</span>
            </div>
            <div className="flex items-start gap-2">
              <UsersIcon className="h-5 w-5 text-blue-500 mt-1" />
              <span><span className="font-semibold">Nombre de personnes :</span> {hameau.nombre_personne}</span>
            </div>
  
            {/* Bouton de suppression */}
            <div className="pt-6">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                <TrashIcon className="h-5 w-5" />
                {loading ? "Suppression..." : "Supprimer l'hameau"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default HameauPopup;
  