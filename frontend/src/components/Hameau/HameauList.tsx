import axios from "axios";
import { buildApiUrl } from "../../config/api";
import { useEffect, useState, useRef, useMemo } from "react";
import HameauCard from "./HameauCard";
import HameauPopup from "./HameauPopup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, Search, MapPin } from "lucide-react"; // Icônes pour affichage vide et chargement
import { Input } from "@/components/ui/input";
import useNotificationService from "../../hooks/useNotificationService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Définir l'interface pour un Hameau
interface Hameau {
    id: number;
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
    const [searchTerm, setSearchTerm] = useState(""); // Ajout de l'état de recherche
    const { showError, showInfo } = useNotificationService();
    const notificationsShown = useRef<boolean>(false); // Pour suivre si les notifications ont déjà été affichées
    
    // Définir une position centrale pour la carte (Madagascar)
    const mapCenter: L.LatLngTuple = [-18.8792, 47.5079]; // Coordonnées de Madagascar
    
    // Référence pour la carte Leaflet
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    
    // Configuration des icônes Leaflet pour éviter les problèmes avec webpack
    useEffect(() => {
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
    }, []);

    useEffect(() => {
        const fetchHameaux = async () => {
            try {
                // Utiliser un AbortController pour gérer le timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
                
                const response = await axios.get(buildApiUrl("/api/hameau"), {
                    signal: controller.signal,
                    timeout: 5000 // Timeout de 5 secondes (redondant avec AbortController mais plus sûr)
                });
                
                clearTimeout(timeoutId);
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
    
    // Filtrer les hameaux en fonction du terme de recherche
    const filteredData = useMemo(() => {
        return data.filter(hameau => 
            hameau.Nom.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);
    
    // Icônes personnalisées pour les hameaux selon leur couverture vaccinale
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
    
    // Groupe de marqueurs pour faciliter la gestion des marqueurs sur la carte
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    
    // Initialisation de la carte
    useEffect(() => {
        // Si les données sont chargées et que la carte n'est pas encore initialisée
        if (!loading && data && data.length > 0 && mapContainerRef.current && !mapRef.current) {
            // Initialisation de la carte
            const map = L.map(mapContainerRef.current).setView(mapCenter, 6);
            
            // Ajout du fond de carte
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Création d'un groupe de marqueurs
            const markersLayer = L.layerGroup().addTo(map);
            
            // Sauvegarde des références
            mapRef.current = map;
            markersLayerRef.current = markersLayer;
        }
        
        // Nettoyage à la destruction du composant
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markersLayerRef.current = null;
            }
        };
    }, [data, loading, mapCenter]);
    
    // Mise à jour des marqueurs sur la carte en fonction des données filtrées
    useEffect(() => {
        // Si la carte est initialisée et que nous avons des données filtrées
        if (mapRef.current && markersLayerRef.current && filteredData) {
            // Effacer tous les marqueurs existants
            markersLayerRef.current.clearLayers();
            
            // Tableau pour stocker les coordonnées valides
            const validCoordinates: L.LatLngTuple[] = [];
            
            // Ajouter les nouveaux marqueurs pour les données filtrées
            filteredData.forEach((hameau) => {
                if (hameau.px && hameau.py) {
                    // Conversion des coordonnées en nombres si nécessaire
                    const lat = typeof hameau.py === 'string' ? parseFloat(hameau.py) : hameau.py;
                    const lng = typeof hameau.px === 'string' ? parseFloat(hameau.px) : hameau.px;
                    
                    // Calculer le pourcentage de couverture vaccinale
                    const vaccinationCoverage = hameau.nombre_enfant && hameau.nombre_enfant > 0 ?
                        Math.round(((hameau.nombre_enfant_vaccines || 0) / hameau.nombre_enfant) * 100) : 0;
                    
                    // Sélectionner l'icône en fonction de la couverture vaccinale
                    let icon;
                    if (vaccinationCoverage < 50) {
                        icon = lowCoverageIcon; // Faible couverture (rouge)
                    } else if (vaccinationCoverage < 75) {
                        icon = mediumCoverageIcon; // Couverture moyenne (orange)
                    } else {
                        icon = goodCoverageIcon; // Bonne couverture (vert)
                    }
                    
                    // Créer un marqueur avec popup interactif
                    const marker = L.marker([lat, lng] as L.LatLngTuple, { icon })
                        .bindPopup(`
                            <div>
                                <h3 class="font-bold">${hameau.Nom}</h3>
                                <p>Population: ${hameau.nombre_personne || "N/A"}</p>
                                <p>Enfants: ${hameau.nombre_enfant || "N/A"}</p>
                                <p>Enfants vaccinés: ${hameau.nombre_enfant_vaccines || "N/A"}</p>
                                <p>Couverture vaccinale: ${vaccinationCoverage}%</p>
                                <button class="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" 
                                    onclick="window.dispatchEvent(new CustomEvent('openHameauDetails', {detail: ${hameau.id}}))">Voir détails</button>
                            </div>
                        `);
                    
                    // Ajouter le marqueur au groupe de marqueurs
                    marker.addTo(markersLayerRef.current!);
                    
                    // Ajouter les coordonnées valides au tableau
                    validCoordinates.push([lat, lng] as L.LatLngTuple);
                }
            });
            
            // Ajuster la vue pour inclure tous les marqueurs si nous avons des coordonnées valides
            if (validCoordinates.length > 0 && mapRef.current && mapRef.current.getContainer() && document.body.contains(mapRef.current.getContainer())) {
                try {
                    mapRef.current.fitBounds(L.latLngBounds(validCoordinates));
                } catch (error) {
                    console.warn("Erreur lors de l'ajustement de la vue de la carte:", error);
                }
            }
        }
    }, [filteredData, goodCoverageIcon, mediumCoverageIcon, lowCoverageIcon]);
    
    // Gestionnaire d'événement pour l'ouverture des détails depuis la carte
    useEffect(() => {
        const handleOpenHameauDetails = (event: CustomEvent) => {
            const hameauId = event.detail;
            const hameau = data.find(h => h.id === hameauId);
            if (hameau) {
                handleDetailsClick(hameau);
            }
        };
        
        // Ajouter l'écouteur d'événement
        window.addEventListener('openHameauDetails', handleOpenHameauDetails as EventListener);
        
        // Nettoyer l'écouteur d'événement
        return () => {
            window.removeEventListener('openHameauDetails', handleOpenHameauDetails as EventListener);
        };
    }, [data, handleDetailsClick]);

    return (
        <div className="flex flex-col items-center">
             {/* Barre de recherche */}
             <div className="w-full max-w-md mb-6 rounded-full">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Rechercher un hameau par nom..."
                        className="pl-9 border-gray-300 focus:border-blue-500 rounded-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            {/* Carte des hameaux */}
            {!loading && data && data.length > 0 && (
                <div className="w-full max-w-[95%] mb-6">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-500" />
                                <h2 className="text-lg font-medium">Carte des hameaux</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                    <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                                    Bonne couverture (&gt;75%)
                                </Badge>
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                    <span className="w-3 h-3 rounded-full bg-orange-500 mr-1"></span>
                                    Moyenne (50-75%)
                                </Badge>
                                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                    <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                                    Faible (&lt;50%)
                                </Badge>
                            </div>
                        </div>
                        <div 
                            ref={mapContainerRef} 
                            className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200"
                        />
                    </div>
                </div>
            )}
            
           
            
           
            {loading ? (
                <div className="flex flex-col items-center justify-center w-full max-w-lg p-6 text-center border border-gray-200 rounded-lg">
                    <div className="mb-4">
                        <Loader2 className="w-12 h-12 text-gray-500 animate-spin mx-auto" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-600 mb-1">Chargement en cours...</h3>
                        <p className="text-gray-500">Veuillez patienter.</p>
                    </div>
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full max-w-lg p-6 text-center border border-gray-200 rounded-lg">
                    <div className="mb-4">
                        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-600 mb-1">Aucun hameau trouvé</h3>
                        <p className="text-gray-500">Ajoutez un nouveau hameau pour commencer.</p>
                    </div>
                </div>
            ) : (
                <>
                    {filteredData.length === 0 && searchTerm && (
                        <div className="w-full flex justify-center mb-6">
                            <div className="w-full max-w-md p-4 text-center border border-gray-200 rounded-lg">
                                <div className="flex flex-col items-center py-2">
                                    <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                                    <p className="text-gray-700">Aucun hameau ne correspond à votre recherche</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredData.map((hameau) => (
                            <HameauCard 
                                key={hameau.id}
                                hameau={hameau}
                                onDetailsClick={handleDetailsClick}
                            />
                        ))}
                    </div>
                </>
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
