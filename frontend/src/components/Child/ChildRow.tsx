function ChildRow({ enfant, isEven, onDetailsClick }) {
    return (
        <tr className={`${isEven ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}>
            <td className="py-4 px-6 border-b border-gray-200 text-black font-medium text-left">{enfant.Nom}</td>
            <td className="py-4 px-6 border-b border-gray-200 text-gray-700 text-left">{enfant.Prenom}</td>
            <td className="py-4 px-6 border-b border-gray-200 text-gray-700 text-left">
                {new Date(enfant.date_naissance).toLocaleDateString()}
            </td>
            <td className="py-4 px-6 border-b border-gray-200 text-gray-700 text-left">{enfant.Domicile}</td>
            <td className="py-4 px-6 border-b border-gray-200 text-gray-700">
                <button
                    onClick={() => onDetailsClick(enfant)}
                    className="text-blue-500 "
                >
                    Détails
                </button>
            </td>
        </tr>
    );
}

export default ChildRow;
