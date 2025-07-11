import axios from "axios";
import { useEffect, useState } from "react";
import HameauCard from "./HameauCard";
import HameauPopup from "./HameauPopup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react"; // Icônes pour affichage vide et chargement

// Définir l'interface pour un Hameau
interface Hameau {
    ID?: number;
    id?: number;
    Nom: string;
    px: number;
    py: number;
    nombre_personne?: number;
    nombre_enfant?: number;
    nombre_enfant_vaccines?: number;
    [key: string]: any;
}

export default function HameauList() {
    const [data, setData] = useState<Hameau[]>([]);
    const [selectedHameau, setSelectedHameau] = useState<Hameau | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true); // Ajout de l'état de chargement

    useEffect(() => {
        axios.get("http://localhost:3000/api/hameau")
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => setLoading(false)); // Fin du chargement
    }, []);

    const handleDetailsClick = (hameau: Hameau) => {
        setSelectedHameau(hameau);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedHameau(null);
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
                        <CardTitle className="text-gray-600">Aucun hameau trouvé</CardTitle>
                        <p className="text-gray-500">Ajoutez un nouveau hameau pour commencer.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {data.map((hameau) => (
                        <HameauCard 
                            key={hameau.ID || hameau.id}
                            hameau={hameau}
                            onDetailsClick={handleDetailsClick}
                        />
                    ))}
                </div>
            )}

            <Dialog open={showPopup} onOpenChange={setShowPopup}>
                <DialogContent className="max-w-7xl w-[95%] p-0">
                    <DialogHeader className="rounded-t-lg px-6 py-4 bg-gradient-to-r from-blue-100 via-white to-blue-100 border-b border-blue-200">
                        <DialogTitle className="text-2xl font-bold text-blue-700">Détails du hameau</DialogTitle>
                    </DialogHeader>
                    {selectedHameau && <HameauPopup hameau={selectedHameau} onClose={closePopup} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
