import axios from "axios";
import { useEffect, useState } from "react";
import VaccineCard from "./VaccineCard";
import VaccinePopup from "./VaccinePopup";

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

    const handleDetailsClick = (vaccine) => {
        setSelectedVaccine(vaccine);
        setShowPopup(true);
    }

    const closePopup = () => {
        setShowPopup(false);
        setSelectedVaccine(null);
    }

    return (
        <div className="p-20">     
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.map((vaccine) => (
                    <VaccineCard 
                        key={vaccine.id}
                        vaccine={vaccine}
                        onDetailsClick={handleDetailsClick}
                    />
                ))}
            </div>
            {
                showPopup && (
                    <VaccinePopup 
                        vaccine={selectedVaccine}
                        onClose={closePopup}
                    />
            )}
        </div>
    );
}
