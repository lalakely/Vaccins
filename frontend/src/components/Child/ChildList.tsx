import axios from "axios";
import { useEffect, useState } from "react";
import ChildRow from "./ChildRow";
import ChildDetailsPopup from "./ChildDetailsPopup";

function ChildList() {
    const [data, setData] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:3000/api/enfants')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }, []);

    const handleDetailsClick = (enfant) => {
        setSelectedChild(enfant);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedChild(null);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Liste des Enfants</h1>
            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="py-3 px-6 text-left">ID</th>
                            <th className="py-3 px-6 text-left">Nom</th>
                            <th className="py-3 px-6 text-left">Prénom</th>
                            <th className="py-3 px-6 text-left">Date de Naissance</th>
                            <th className="py-3 px-6 text-left">Domicile</th>
                            <th className="py-3 px-6 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((enfant, index) => (
                            <ChildRow
                                key={enfant.id}
                                enfant={enfant}
                                isEven={index % 2 === 0}
                                onDetailsClick={handleDetailsClick}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            {showPopup && (
                <ChildDetailsPopup
                    enfant={selectedChild}
                    onClose={closePopup}
                />
            )}
        </div>
    );
}

export default ChildList;
