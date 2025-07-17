import axios from "axios";
import { useEffect, useState, useRef } from "react";
import HameauCard from "./HameauCard";
import HameauPopup from "./HameauPopup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, WifiOff } from "lucide-react"; // Icônes pour affichage vide et chargement
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
    const [apiAvailable, setApiAvailable] = useState(true); // Indiquer si l'API est disponible
    const { showError, showInfo } = useNotificationService();
    const notificationsShown = useRef<boolean>(false); // Pour suivre si les notifications ont déjà été affichées

    useEffect(() => {
        const fetchHameaux = async () => {
            try {
                // Utiliser un AbortController pour gérer le timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
                
                const response = await axios.get("http://localhost:3000/api/hameau", {
                    signal: controller.signal,
                    timeout: 5000 // Timeout de 5 secondes (redondant avec AbortController mais plus sûr)
                });
                
                clearTimeout(timeoutId);
                setApiAvailable(true);
                setData(response.data);
                
                // Sauvegarder les données dans le localStorage pour une utilisation hors ligne
                try {
                    localStorage.setItem('hameaux_data', JSON.stringify(response.data));
                    console.log('Données des hameaux sauvegardées dans le cache local');
                } catch (cacheError) {
                    console.error('Erreur lors de la sauvegarde des données dans le cache:', cacheError);
                }
                
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
            } catch (error: any) {
                setApiAvailable(false);
                
                // Gérer les différents types d'erreurs
                if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
                    console.warn("Timeout lors de la récupération des hameaux:", error);
                    showError("Erreur de connexion", "Le serveur met trop de temps à répondre. Mode hors ligne activé.");
                } else if (error.response) {
                    // Erreur avec réponse du serveur (400, 404, 500, etc.)
                    console.warn(`Erreur ${error.response.status} lors de la récupération des hameaux:`, error);
                    showError("Erreur de chargement", `Impossible de charger la liste des hameaux (${error.response.status}). Mode hors ligne activé.`);
                } else {
                    console.error("Erreur lors de la récupération des hameaux:", error);
                    showError("Erreur de chargement", "Impossible de charger la liste des hameaux. Mode hors ligne activé.");
                }
                
                // Essayer de charger les données mises en cache pour le mode hors ligne
                try {
                    const cachedData = localStorage.getItem('hameaux_data');
                    if (cachedData) {
                        const parsedData = JSON.parse(cachedData);
                        setData(parsedData);
                        console.log('Données chargées depuis le cache:', parsedData.length, 'hameaux');
                    } else {
                        setData([]);
                    }
                } catch (cacheError) {
                    console.error('Erreur lors du chargement des données mises en cache:', cacheError);
                    setData([]);
                }
            } finally {
                setLoading(false); // Fin du chargement
            }
        };
        
        fetchHameaux();
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
            {!apiAvailable && (
                <Badge variant="outline" className="mb-4 bg-yellow-50 text-yellow-800 border-yellow-300 flex items-center gap-2">
                    <WifiOff className="h-3 w-3" /> Mode hors ligne - Certaines fonctionnalités peuvent être limitées
                </Badge>
            )}
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
                <DialogContent className="p-0 max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="rounded-t-lg px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-blue-200">
                        <DialogTitle className="text-2xl font-bold text-blue-700">Détails de l'Hameau </DialogTitle>
                    </DialogHeader>
                    {selectedHameau && <HameauPopup hameau={selectedHameau} onClose={closePopup} />}
                </DialogContent>    
            </Dialog>
            
        </div>
    );
}
