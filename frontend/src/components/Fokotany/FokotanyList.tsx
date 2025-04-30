import axios from "axios";
import { useEffect, useState } from "react";
import FokotanyCard from "./FokotanyCard";
import FokotanyPopup from "./FokotanyPopup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react"; // Icônes pour affichage vide et chargement

export default function FokotanyList() {
    const [data, setData] = useState([]);
    const [selectedFokotany, setSelectedFokotany] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true); // Ajout de l'état de chargement

    useEffect(() => {
        axios.get("http://localhost:3000/api/fokotany")
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => setLoading(false)); // Fin du chargement
    }, []);

    const handleDetailsClick = (fokotany) => {
        setSelectedFokotany(fokotany);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedFokotany(null);
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
                        <CardTitle className="text-gray-600">Aucun fokotany trouvé</CardTitle>
                        <p className="text-gray-500">Ajoutez un nouveau fokotany pour commencer.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {data.map((fokotany) => (
                        <FokotanyCard 
                            key={fokotany.ID}
                            fokotany={fokotany}
                            onDetailsClick={handleDetailsClick}
                        />
                    ))}
                </div>
            )}

            <Dialog open={showPopup} onOpenChange={setShowPopup}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Détails du fokotany</DialogTitle>
                    </DialogHeader>
                    {selectedFokotany && <FokotanyPopup fokotany={selectedFokotany} onClose={closePopup} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
