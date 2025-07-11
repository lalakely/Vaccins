import axios from "axios";
import { useEffect, useState } from "react";
import VaccineCard from "./VaccineCard";
import VaccinePopup from "./VaccinePopup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react"; // Icônes pour affichage vide et chargement

export default function VaccineList() {
    const [data, setData] = useState([]);
    const [selectedVaccine, setSelectedVaccine] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true); // Ajout de l'état de chargement

    useEffect(() => {
        axios.get("http://localhost:3000/api/vaccins")
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => setLoading(false)); // Fin du chargement
    }, []);

    const handleDetailsClick = (vaccine) => {
        setSelectedVaccine(vaccine);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedVaccine(null);
    };

    return (
        <div className="p-6 flex flex-col items-center">
            {loading ? (
                <Card className="flex flex-col items-center justify-center w-full max-w-lg p-6 text-center">
                    <CardHeader>
                        <Loader2 className="w-12 h-12 text-gray-500 animate-spin mx-auto" />
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-gray-600">Chargement en cours...</CardTitle>
                        <p className="text-gray-500">Veuillez patienter.</p>
                    </CardContent>
                </Card>
            ) : data.length === 0 ? (
                <Card className="flex flex-col items-center justify-center w-full max-w-lg p-6 text-center">
                    <CardHeader>
                        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto" />
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-gray-600">Aucun vaccin trouvé</CardTitle>
                        <p className="text-gray-500">Ajoutez un nouveau vaccin pour commencer.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {data.map((vaccine) => (
                        <VaccineCard 
                            key={vaccine.id}
                            vaccine={vaccine}
                            onDetailsClick={handleDetailsClick}
                        />
                    ))}
                </div>
            )}

            <Dialog open={showPopup} onOpenChange={setShowPopup}>
                <DialogContent className="max-w-7xl w-[95%] p-0">
                    <DialogHeader className="rounded-t-lg px-6 py-4 bg-gradient-to-r from-red-100 via-white to-red-100 border-b border-red-200">
                        <DialogTitle className="text-2xl font-bold text-red-700">Détails du vaccin</DialogTitle>
                    </DialogHeader>
                    {selectedVaccine && <VaccinePopup vaccine={selectedVaccine} onClose={closePopup} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
