import axios from "axios";
import { useEffect, useState, useRef } from "react";
import HameauCard from "./HameauCard";
import HameauPopup from "./HameauPopup";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react"; // Icônes pour affichage vide et chargement
import useNotificationService from "../../hooks/useNotificationService";

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
    const { showError, showInfo } = useNotificationService();
    const notificationsShown = useRef<boolean>(false); // Pour suivre si les notifications ont déjà été affichées

    useEffect(() => {
        axios.get("http://localhost:3000/api/hameau")
            .then((response) => {
                setData(response.data);
                if (response.data.length > 0 && !notificationsShown.current) {
                    // N'afficher les notifications qu'une seule fois par session
                    showInfo("Données chargées", `${response.data.length} hameaux ont été chargés`);
                    
                    // Vérifier les hameaux avec une faible couverture vaccinale
                    const lowVaccinationHameaux = response.data.filter((h: Hameau) => {
                        const percentage = h.nombre_enfant && h.nombre_enfant > 0 ? 
                            Math.round(((h.nombre_enfant_vaccines || 0) / h.nombre_enfant) * 100) : 0;
                        return percentage < 50;
                    });
                    
                    if (lowVaccinationHameaux.length > 0) {
                        showError("Alerte de vaccination", 
                            `${lowVaccinationHameaux.length} hameaux ont une couverture vaccinale inférieure à 50%`, {
                            actionLink: "/Hameau"
                        });
                    }
                    
                    // Marquer que les notifications ont été affichées
                    notificationsShown.current = true;
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                showError("Erreur de chargement", "Impossible de charger la liste des hameaux. Veuillez réessayer plus tard.");
            })
            .finally(() => setLoading(false)); // Fin du chargement
    }, [showInfo, showError]);

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
                {selectedHameau && <HameauPopup hameau={selectedHameau} onClose={closePopup} />}
            </Dialog>
        </div>
    );
}
