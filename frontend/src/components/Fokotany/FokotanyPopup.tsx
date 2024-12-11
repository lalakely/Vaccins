import { XMarkIcon } from "@heroicons/react/24/solid";

function FokotanyPopup ({fokotany , onClose}){
    if (!fokotany) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="relative bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
             {/* Bouton de fermeture avec icône */}
             <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none">
                 <XMarkIcon className="h-5 w-5" /> {/* Utilisation de XMarkIcon */}
             </button>
             <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                 <span className="font-semibold">Détails du fokotany :</span> {fokotany.Nom} 
             </h2> 
             <p className="text-gray-600 text-left">
                 <span className="font-semibold">px :</span> {fokotany.px} 
             </p>
             <p className="text-gray-600 text-left">
                 <span className="font-semibold">py :</span>  {fokotany.py}
             </p>
             <p className="text-gray-600 text-left">
                 <span className="font-semibold">Nombre total d'enfant dans le fokotany : </span>{fokotany.nombre_enfant}
             </p>
             <p className="text-gray-600 text-left">
                 <span className="font-semibold">Nombre totalt d'enfant vaccinés dans le fokotany : </span>{fokotany.nombre_enfant_vaccines}
             </p>
         </div>
     </div>
    );
}

export default FokotanyPopup;