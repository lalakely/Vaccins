
import { XMarkIcon } from '@heroicons/react/24/solid'; // Importation de la bonne icône pour la version 2

function ChildDetailsPopup({ enfant, onClose }) {
    if (!enfant) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                {/* Bouton de fermeture avec icône */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none">
                    <XMarkIcon className="h-5 w-5" /> {/* Utilisation de XMarkIcon */}
                </button>
                
                {/* Titre */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                    Détails de l'enfant
                </h2>
                
                {/* Informations détaillées */}
                <div className="space-y-4">
                    <p className="text-gray-700"><span className="font-semibold">ID:</span> {enfant.id}</p>
                    <p className="text-gray-700"><span className="font-semibold">Nom:</span> {enfant.Nom}</p>
                    <p className="text-gray-700"><span className="font-semibold">Prénom:</span> {enfant.Prenom}</p>
                    <p className="text-gray-700"><span className="font-semibold">Code:</span> {enfant.CODE}</p>
                    <p className="text-gray-700"><span className="font-semibold">Date de naissance:</span> {new Date(enfant.date_naissance).toLocaleDateString()}</p>
                    <p className="text-gray-700"><span className="font-semibold">Âge au premier contact:</span> {enfant.age_premier_contact}</p>
                    <p className="text-gray-700"><span className="font-semibold">Sexe:</span> {enfant.SEXE}</p>
                    <p className="text-gray-700"><span className="font-semibold">Nom de la mère:</span> {enfant.NomMere}</p>
                    <p className="text-gray-700"><span className="font-semibold">Nom du père:</span> {enfant.NomPere}</p>
                    <p className="text-gray-700"><span className="font-semibold">Domicile:</span> {enfant.Domicile}</p>
                    <p className="text-gray-700"><span className="font-semibold">Fokotany:</span> {enfant.Fokotany}</p>
                    <p className="text-gray-700"><span className="font-semibold">Hameau:</span> {enfant.Hameau}</p>
                    <p className="text-gray-700"><span className="font-semibold">Téléphone:</span> {enfant.Telephone}</p>
                </div>

               
            </div>
        </div>
    );
}

export default ChildDetailsPopup;
