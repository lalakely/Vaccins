import { useState, useEffect, useRef } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaMapMarkerAlt, FaBuilding } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import L from "leaflet";
import type { Map as LeafletMap, LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { formStyles } from "@/components/ui/form-styles";
import { useToast } from "@/hooks/use-toast";

// Fix pour les icônes Leaflet dans React
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function FokotanyAdd() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        Nom: '',
        px: '',
        py: '',
    });
    
    const [loading, setLoading] = useState(false);
    
    // État pour la coordonnée sélectionnée sur la carte, utilisé pour gérer le marqueur
    const [, setPosition] = useState<[number, number] | null>(null);
    
    // Centre de la carte par défaut (Madagascar)
    const mapCenter: [number, number] = [-18.8792, 47.5079];
    const mapZoom = 6;
    
    // Références pour la carte et le marqueur Leaflet
    const mapRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Initialisation et nettoyage de la carte Leaflet
    useEffect(() => {
        // Seulement si le dialogue est ouvert et que la carte n'est pas encore initialisée
        if (isDialogOpen && !mapInitialized && mapContainerRef.current) {
            // Petite temporisation pour s'assurer que le DOM est prêt
            const timer = setTimeout(() => {
                // Initialisation de la carte
                const map = L.map(mapContainerRef.current!).setView(mapCenter, mapZoom);
                
                // Ajout du fond de carte
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                // Gestion du clic sur la carte
                map.on('click', (e: LeafletMouseEvent) => {
                    const { lat, lng } = e.latlng;
                    
                    // Mise à jour de la position dans l'état React
                    setPosition([lat, lng]);
                    setFormData(prev => ({ 
                        ...prev, 
                        px: lng.toFixed(6), 
                        py: lat.toFixed(6) 
                    }));
                    
                    // Mise à jour ou création du marqueur
                    if (markerRef.current) {
                        markerRef.current.setLatLng([lat, lng]);
                    } else {
                        markerRef.current = L.marker([lat, lng])
                            .addTo(map)
                            .bindPopup(`
                                <div>
                                    <strong>Coordonnées:</strong><br/>
                                    Lat: ${lat.toFixed(6)}<br/>
                                    Lng: ${lng.toFixed(6)}
                                </div>
                            `)
                            .openPopup();
                    }
                });
                
                // Sauvegarde de la référence de la carte
                mapRef.current = map;
                setMapInitialized(true);
                
                // Ajustement de la taille après un petit délai pour s'assurer que tout est bien rendu
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [isDialogOpen, mapInitialized, mapCenter, mapZoom]);
    
    // Réajustement de la taille de la carte quand le dialogue est ouvert
    useEffect(() => {
        if (isDialogOpen && mapRef.current) {
            // Petit délai pour s'assurer que le DOM est pleinement rendu
            const timer = setTimeout(() => {
                mapRef.current?.invalidateSize();
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isDialogOpen]);
    
    // Nettoyage de la carte Leaflet lors du démontage du composant
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
                setMapInitialized(false);
            }
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    // Réinitialisation du formulaire et fermeture du dialogue
    const handleCancel = () => {
        setFormData({ Nom: '', px: '', py: '' });
        setPosition(null); // Réinitialise la position du marqueur
        setIsDialogOpen(false);
    };
    
    // Gestion de la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation de base
        if (!formData.Nom.trim()) {
            toast({
                title: "Erreur de validation",
                description: "Le nom du Fokotany est requis",
                variant: "destructive"
            });
            return;
        }
        
        if (!formData.px || !formData.py) {
            toast({
                title: "Erreur de validation",
                description: "Veuillez sélectionner un point sur la carte",
                variant: "destructive"
            });
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await fetch('http://localhost:3000/api/fokotany', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            
            if (response.ok) {
                toast({
                    title: "Succès",
                    description: "Le Fokotany a été ajouté avec succès",
                    variant: "default"
                });
                // Réinitialisation et fermeture
                setFormData({ Nom: '', px: '', py: '' });
                setPosition(null); // Réinitialise la position du marqueur
                setIsDialogOpen(false);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Une erreur est survenue");
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du Fokotany:", error);
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Une erreur inattendue est survenue",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <CiCirclePlus className="h-5 w-5" />
                        Ajouter un Fokotany
                    </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl border border-gray-200" aria-describedby="fokotany-dialog-description">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            <FaBuilding /> Ajouter un nouveau Fokotany
                        </DialogTitle>
                        <DialogDescription id="fokotany-dialog-description">
                            Remplissez les informations ci-dessous pour ajouter un nouveau Fokotany.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-2">
                                <Label htmlFor="Nom" className={formStyles.label}>
                                    <FaBuilding className="text-gray-500" /> Nom du Fokotany
                                </Label>
                                <Input
                                    id="Nom"
                                    name="Nom"
                                    placeholder="Entrez le nom du Fokotany"
                                    value={formData.Nom}
                                    onChange={handleInputChange}
                                    className={formStyles.input}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="px" className={formStyles.label}>
                                        Longitude (px)
                                    </Label>
                                    <Input
                                        id="px"
                                        name="px"
                                        type="text"
                                        placeholder="Ex: 47.5079"
                                        value={formData.px}
                                        onChange={handleInputChange}
                                        className={formStyles.input}
                                        required
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="py" className={formStyles.label}>
                                        Latitude (py)
                                    </Label>
                                    <Input
                                        id="py"
                                        name="py"
                                        type="text"
                                        placeholder="Ex: -18.8792"
                                        value={formData.py}
                                        onChange={handleInputChange}
                                        className={formStyles.input}
                                        required
                                        readOnly
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label className={formStyles.label}>
                                    <FaMapMarkerAlt className="text-gray-500" /> Sélectionnez un point sur la carte
                                </Label>
                                <div 
                                    id="fokotany-map-container"
                                    className="mt-2 h-[400px] border border-gray-300 rounded-lg overflow-hidden"
                                    ref={mapContainerRef}
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3 pt-4">
                                <Button 
                                    variant="outline" 
                                    type="button" 
                                    className="w-24"
                                    onClick={handleCancel}
                                >
                                    Annuler
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="w-24"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Ajout...
                                        </>
                                    ) : (
                                        "Ajouter"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
