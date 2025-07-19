import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import FokotanyCard from "./FokotanyCard";
import FokotanyPopup from "./FokotanyPopup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Loader2, WifiOff, Search, MapPin } from "lucide-react"; // Icônes pour affichage vide, chargement et mode hors ligne
import { Input } from "@/components/ui/input";
import useNotificationService from "../../hooks/useNotificationService";
import useApi from "../../hooks/useApi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
    const [searchTerm, setSearchTerm] = useState(""); // Ajout de l'état de recherche
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
    
    // Filtrer les fokotany en fonction du terme de recherche
    const filteredData = useMemo(() => {
        if (!data || !searchTerm.trim()) return data;
        
        const searchTermLower = searchTerm.toLowerCase();
        return data.filter(fokotany => 
            fokotany.Nom.toLowerCase().includes(searchTermLower)
        );
    }, [data, searchTerm]);

    // Définir une position centrale pour la carte (Madagascar)
    const mapCenter: L.LatLngTuple = [18.8792, 47.5079]; // Coordonnées de Madagascar
    
    // Référence pour la carte Leaflet
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    
    // Fix pour les icônes Leaflet dans React
    useEffect(() => {
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
    }, []);
    
    // Icônes personnalisées pour les fokotany selon leur couverture vaccinale
    const goodCoverageIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);
    
    const mediumCoverageIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);
    
    const lowCoverageIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);
    
    // Initialisation et gestion de la carte
    useEffect(() => {
        // Si les données sont chargées et que la carte n'est pas encore initialisée
        if (!isLoading && data && data.length > 0 && mapContainerRef.current && !mapRef.current) {
            // Initialisation de la carte
            const map = L.map(mapContainerRef.current).setView(mapCenter, 6);
            
            // Ajout du fond de carte
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Sauvegarde de la référence de la carte
            mapRef.current = map;
            
            // Tableau pour stocker les coordonnées valides
            const validCoordinates: L.LatLngTuple[] = [];
            
            data.forEach((fokotany) => {
                if (fokotany.px && fokotany.py) {
                    // Conversion des coordonnées en nombres si nécessaire
                    const lat = typeof fokotany.py === 'string' ? parseFloat(fokotany.py) : fokotany.py;
                    const lng = typeof fokotany.px === 'string' ? parseFloat(fokotany.px) : fokotany.px;
                    
                    // Calculer le pourcentage de couverture vaccinale
                    const vaccinationCoverage = fokotany.nombre_enfant && fokotany.nombre_enfant > 0 ?
                        Math.round(((fokotany.nombre_enfant_vaccines || 0) / fokotany.nombre_enfant) * 100) : 0;
                    
                    // Sélectionner l'icône en fonction de la couverture vaccinale
                    let icon = goodCoverageIcon; // Par défaut, bonne couverture
                    if (vaccinationCoverage < 50) {
                        icon = lowCoverageIcon; // Faible couverture
                    } else if (vaccinationCoverage < 75) {
                        icon = mediumCoverageIcon; // Couverture moyenne
                    }
                    
                    // Ajouter le marqueur à la carte
                    L.marker([lat, lng] as L.LatLngTuple, { icon })
                        .addTo(map)
                        .bindPopup(`
                            <div>
                                <h3 class="font-bold">${fokotany.Nom}</h3>
                                <p>Population: ${fokotany.nombre_personne || "N/A"}</p>
                                <p>Enfants: ${fokotany.nombre_enfant || "N/A"}</p>
                                <p>Enfants vaccinés: ${fokotany.nombre_enfant_vaccines || "N/A"}</p>
                                <p>Couverture vaccinale: ${vaccinationCoverage}%</p>
                            </div>
                        `);
                    
                    // Ajouter les coordonnées valides au tableau
                    validCoordinates.push([lat, lng] as L.LatLngTuple);
                }
            });
            
            // Ajuster la vue pour inclure tous les marqueurs
            if (validCoordinates.length > 0) {
                map.fitBounds(L.latLngBounds(validCoordinates));
            }
        }
        
        // Nettoyage à la destruction du composant
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [data, isLoading, goodCoverageIcon, mediumCoverageIcon, lowCoverageIcon, mapCenter]);
    
    return (
        <div className="p-6 flex flex-col items-center">
 {/* Barre de recherche */}
            <div className="w-full max-w-md mb-6 rounded-full">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 rounded-full" />
                    <Input
                        type="text"
                        placeholder="Rechercher un fokotany par nom..."
                        className="pl-9 border-gray-300 focus:border-red-500 rounded-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Carte des fokotany */}
            {!isLoading && data && data.length > 0 && (
                <div className="w-full max-w-6xl mb-6">
                    <div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-red-500" />
                                Carte des fokotany
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div 
                                ref={mapContainerRef} 
                                className="h-[400px] w-full border border-gray-200 rounded-xl overflow-hidden"
                            />
                        </CardContent>
                    </div>
                </div>
            )}
            
           
            
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
                <>
                    {filteredData && filteredData.length === 0 && searchTerm && (
                        <div className="w-full flex justify-center mb-6">
                            <Card className="w-full max-w-md p-4 text-center">
                                <CardContent className="flex flex-col items-center pt-4">
                                    <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                                    <p className="text-gray-700">Aucun fokotany ne correspond à votre recherche</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredData && filteredData.map((fokotany) => (
                            <FokotanyCard 
                                key={fokotany.ID}
                                fokotany={fokotany}
                                onDetailsClick={handleDetailsClick}
                            />
                        ))}
                    </div>
                </>
            )}

            <Dialog open={showPopup} onOpenChange={setShowPopup}>
                <DialogContent className="p-0 max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="rounded-t-lg px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b border-red-200 ">
                        <DialogTitle className="text-2xl font-bold text-red-700">Détails du fokotany </DialogTitle>
                    </DialogHeader>
                    {selectedFokotany && <FokotanyPopup fokotany={selectedFokotany} onClose={closePopup} />}
                </DialogContent>    
            </Dialog>
        </div>
    );
}
