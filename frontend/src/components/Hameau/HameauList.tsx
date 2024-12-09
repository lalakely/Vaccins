import axios from "axios";
import { useEffect , useState } from "react";
import HameauCard from "./HameauCard";
import HameauPopup from "./HameauPopup";

function HameauList (){
    const [data , setData] = useState([]);
    const [selectedHameau, setSelectedHameau] = useState([]);
    const [showPopup , setShowPopup] = useState(false);


    useEffect(() => {
        axios.get("http://localhost:3000/api/hameau")
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.log("Error fetching data :" , error);
            });
    }, []);

    const handleDetailsClick = (hameau) => {
        setSelectedHameau(hameau);
        setShowPopup(true);
    }

    const closePopup = () => {
        setShowPopup(false);
        setSelectedHameau(null);
    }

    return (
       <div className="p-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {  data.map((hameau) => (
                    <HameauCard 
                        key={hameau.ID}
                        hameau={hameau}
                        onDetailsClick={handleDetailsClick}
                    />
                ))}
            </div>
            {
                showPopup && (
                    <HameauPopup 
                        hameau={selectedHameau}
                        onClose={closePopup}
                    />
                )
            }
       </div>
    );
}

export default HameauList;