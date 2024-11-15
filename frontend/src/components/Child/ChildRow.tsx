function ChildRow({ enfant, isEven, onDetailsClick }) {
    return (
        <tr className={`${isEven ? "bg-gray-100" : "bg-white"} hover:bg-gray-200`}>
            <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{enfant.id}</td>
            <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{enfant.Nom}</td>
            <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{enfant.Prenom}</td>
            <td className="py-4 px-6 border-b border-gray-200 text-gray-700">
                {new Date(enfant.date_naissance).toLocaleDateString()}
            </td>
            <td className="py-4 px-6 border-b border-gray-200 text-gray-700">{enfant.Domicile}</td>
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
