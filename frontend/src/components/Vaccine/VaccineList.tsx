import axios from "axios";
import { useEffect, useState } from "react";

export default function VaccineList() {
    const [data, setData] = useState([]);
    const [selectedVaccine, setSelectedVaccine] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:3000/api/vaccins")
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.log("Error fetching data :", error);
            });
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                La liste des Vaccins
            </h1>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.map((vaccine) => (
                    <div
                        key={vaccine.id}
                        className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            {vaccine.Nom}
                        </h2>
                        <p className="text-gray-600">
                            Durée : {vaccine.Duree} jours
                        </p>
                        <p className="text-gray-600">
                            Arrivée : {new Date(vaccine.Date_arrivee).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                            Péremption : {new Date(vaccine.Date_peremption).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
