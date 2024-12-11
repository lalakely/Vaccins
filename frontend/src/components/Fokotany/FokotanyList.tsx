import axios from "axios";
import { useEffect , useState } from "react";
import FokotanyCard from "./FokotanyCard";
import FokotanyPopup from "./FokotanyPopup";

function FokotanyList (){
    const [data , setData] = useState([]);
    const [selectedFokotany , setSelectedFokotany] = useState([]);
    const [showPopup , setShowPopup] = useState(false);


    axios.get("http://localhost:3000/api/fokotany")
        .then((response) => {
            setData(response.data);
        })
        .catch((error) => {
            console.log("Error fetching data :" , error);
        });
    ;

    const handleDetailsClick = (fokotany) => {
        setSelectedFokotany(fokotany);
        setShowPopup(true);
    }

    const closePopup = () => {
        setShowPopup(false);
        setSelectedFokotany(null);
    }

    return (
        <div className="p-20">     
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.map((fokotany) => (
                    <FokotanyCard 
                        key={fokotany.id}
                        fokotany={fokotany}
                        onDetailsClick={handleDetailsClick}
                    />
                ))}
            </div>
            {
                showPopup && (
                    <FokotanyPopup 
                        fokotany={selectedFokotany}
                        onClose={closePopup}
                    />
            )}
        </div>
    );
}

export default FokotanyList;