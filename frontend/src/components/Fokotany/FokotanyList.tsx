import { useEffect, useState, useRef, useCallback } from "react";
import FokotanyCard from "./FokotanyCard";
import FokotanyPopup from "./FokotanyPopup";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, WifiOff } from "lucide-react"; // Icônes pour affichage vide, chargement et mode hors ligne
import useNotificationService from "../../hooks/useNotificationService";
import useApi from "../../hooks/useApi";

// Définir l'interface pour un Fokotany
interface Fokotany {
    ID: number;
    Nom: string;
    px: number;
    py: number;
    nombre_personne?: number;
    nombre_enfant?: number;
    nombre_enfant_vaccines?: number;
    [key: string]: any;
}

export default function FokotanyList() {
    const [selectedFokotany, setSelectedFokotany] = useState<Fokotany | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const { showWarning } = useNotificationService();
    const lowCoverageAlertsShown = useRef<Set<number>>(new Set()); // Pour suivre les fokotany déjà alertés
    
    // Utiliser notre hook useApi pour récupérer la liste des fokotany
    const { 
        data, 
        isLoading, 
        apiAvailable // Nouvel état pour savoir si l'API est disponible
    } = useApi<Fokotany[]>('get', 'api/fokotany', {
        autoExecute: true,
        fallbackData: [],
        timeout: 5000,
        retries: 2,
        onError: (error) => {
            console.error("Error fetching fokotany data:", error);
            showWarning(
                "Problème de connexion", 
                "Impossible de récupérer les données des fokotany depuis le serveur. Mode hors ligne activé.",
                {
                    category: "system",
                    actionLink: "",
                    entityType: "system",
                    entityId: 0
                }
            );
        }
    });

    // Récupérer les données de couverture vaccinale persistées dans le localStorage
    const [cachedVaccinationData, setCachedVaccinationData] = useState<Record<number, { total: number, vaccinated: number }>>({});
    
    // Charger les données mises en cache au démarrage
    useEffect(() => {
        try {
            const storedData = localStorage.getItem('fokotany_vaccination_data');
            if (storedData) {
                setCachedVaccinationData(JSON.parse(storedData));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données mises en cache:', error);
        }
    }, []);

    // Créer une fonction pour vérifier la couverture vaccinale sans utiliser de hooks à l'intérieur
    const checkVaccinationCoverage = useCallback(async (fokotany: Fokotany) => {
        // Éviter les appels multiples pour le même fokotany
        if (lowCoverageAlertsShown.current.has(fokotany.ID)) {
            return;
        }

        // Préparer les données de secours depuis le cache local
        const fallbackData = cachedVaccinationData[fokotany.ID] ? {
            total_enfants: cachedVaccinationData[fokotany.ID].total,
            enfants_vaccines: cachedVaccinationData[fokotany.ID].vaccinated
        } : null;
        
        try {
            // Utiliser fetch au lieu de useApi à l'intérieur de cette fonction
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            try {
                // Utiliser fetch au lieu de useApi qui ne peut pas être appelé dans une fonction
                const response = await fetch(`/api/fokotany/${fokotany.ID}/stats`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                const { total_enfants, enfants_vaccines } = data;
                const percentage = total_enfants > 0 ? Math.round((enfants_vaccines / total_enfants) * 100) : 0;
                
                // Sauvegarder les données dans le cache local pour usage hors ligne
                const newCachedData = {
                    ...cachedVaccinationData,
                    [fokotany.ID]: { total: total_enfants, vaccinated: enfants_vaccines }
                };
                setCachedVaccinationData(newCachedData);
                localStorage.setItem('fokotany_vaccination_data', JSON.stringify(newCachedData));
                
                // Afficher une alerte si la couverture est inférieure à 50%
                if (percentage < 50) {
                    showWarning(
                        "Couverture vaccinale critique", 
                        `Le taux de vaccination dans le fokotany ${fokotany.Nom} est de ${percentage}%, bien en dessous du seuil critique de 50%`,
                        {
                            category: "vaccination_alert",
                            actionLink: `/Fokotany?id=${fokotany.ID}`,
                            entityType: "fokotany",
                            entityId: fokotany.ID
                        }
                    );
                    // Marquer ce fokotany comme déjà alerté
                    lowCoverageAlertsShown.current.add(fokotany.ID);
                }
            } catch (fetchError) {
                clearTimeout(timeoutId);
                
                // Utiliser les données mises en cache en cas d'erreur
                if (fallbackData) {
                    const { total_enfants, enfants_vaccines } = fallbackData;
                    const percentage = total_enfants > 0 ? Math.round((enfants_vaccines / total_enfants) * 100) : 0;
                    
                    if (percentage < 50) {
                        showWarning(
                            "Couverture vaccinale critique (mode hors ligne)", 
                            `Le taux de vaccination dans le fokotany ${fokotany.Nom} est de ${percentage}%, bien en dessous du seuil critique de 50%`,
                            {
                                category: "vaccination_alert",
                                actionLink: `/Fokotany?id=${fokotany.ID}`,
                                entityType: "fokotany",
                                entityId: fokotany.ID
                            }
                        );
                        // Marquer ce fokotany comme déjà alerté
                        lowCoverageAlertsShown.current.add(fokotany.ID);
                    }
                }
            }
        } catch (error) {
            console.warn(`Erreur lors de la vérification de la couverture vaccinale pour ${fokotany.Nom}`);
        }
    }, [showWarning, cachedVaccinationData, setCachedVaccinationData]);

    // Vérifier la couverture vaccinale de chaque fokotany lorsque les données sont chargées
    useEffect(() => {
        if (data && data.length > 0) {
            data.forEach((fokotany: Fokotany) => {
                // Ajouter un délai entre chaque appel pour éviter de surcharger le serveur
                setTimeout(() => {
                    checkVaccinationCoverage(fokotany);
                }, fokotany.ID * 300); // 300ms de délai entre chaque fokotany
            });
        }
    }, [data, checkVaccinationCoverage]);  // Dépendances mises à jour

    const handleDetailsClick = (fokotany: Fokotany) => {
        setSelectedFokotany(fokotany);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedFokotany(null);
    };

    return (
        <div className="p-6 flex flex-col items-center">
            {/* En-tête avec badge mode hors ligne si l'API est indisponible */}
            {!apiAvailable && (
                <div className="w-full flex justify-center mb-4">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 px-3 py-1 flex items-center gap-1">
                        <WifiOff className="h-4 w-4" />
                        Mode hors ligne
                    </Badge>
                </div>
            )}
            
            {isLoading ? (
                <Card className="flex flex-col items-center justify-center w-full max-w-lg p-6 text-center">
                    <CardHeader>
                        <Loader2 className="w-12 h-12 text-gray-500 animate-spin mx-auto" />
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-gray-600">Chargement en cours...</CardTitle>
                        <p className="text-gray-500">Veuillez patienter.</p>
                    </CardContent>
                </Card>
            ) : !data || data.length === 0 ? (
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
                {selectedFokotany && <FokotanyPopup fokotany={selectedFokotany} onClose={closePopup} />}
            </Dialog>
        </div>
    );
}
