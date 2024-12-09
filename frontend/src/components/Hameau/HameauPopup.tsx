import { XMarkIcon } from "@heroicons/react/24/solid";

function HameauPopup ({hameau , onClose}){
    if (!hameau) return null ;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                {/* Bouton de fermeture avec îcones */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none">
                    <XMarkIcon className="h-5 w-5" /> {/*Utilisation de XMarkIcon*/}
                </button>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                    <span className="font-semibold">Détails de l'Hameau :</span> {hameau.Nom} 
                </h2> 
                <p className="text-gray-600 text-left">
                    <span className="font-semibold">px :</span> {hameau.px} 
                </p>
                <p className="text-gray-600 text-left">
                    <span className="font-semibold">py :</span>  {hameau.py}
                </p>
                <p className="text-gray-600 text-left">
                    <span className="font-semibold">Nombre de personnes dans l'hameau : </span> {hameau.nombre_personne}
                </p>
            </div>
        </div>
    );
}   

export default HameauPopup;