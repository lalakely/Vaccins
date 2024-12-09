function HameauCard ({hameau , onDetailsClick}){
    return (
        <div
            key={hameau.id}
            className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow "
        >  
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                {hameau.Nom}
            </h2>
            <button
                onClick={() => onDetailsClick(hameau)}
                className="text-blue-500"
            >
                Détails
            </button>
        </div>
    );
}

export default HameauCard;