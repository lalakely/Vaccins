import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import VaccineCard from "./VaccineCard";
import VaccinePopup from "./VaccinePopup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, PackageCheck, PackageX, AlertTriangle, Database, Search } from "lucide-react"; // Icônes pour affichage
import { Input } from "@/components/ui/input";
import { Vaccine, VaccineStats } from "@/types/vaccine";

export default function VaccineList() {
    const [data, setData] = useState<Vaccine[]>([]);
    const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true); // Ajout de l'état de chargement
    const [searchTerm, setSearchTerm] = useState(""); // Ajout de l'état de recherche
    const [stats, setStats] = useState<VaccineStats>({
        total: 0,
        inStock: 0,
        outOfStock: 0,
        expired: 0
    });

    useEffect(() => {
        axios.get("http://localhost:3000/api/vaccins")
            .then((response) => {
                const vaccines = response.data;
                setData(vaccines);
                
                // Calcul des statistiques
                const today = new Date();
                const vaccineStats = vaccines.reduce((acc: VaccineStats, vaccine: Vaccine) => {
                    // Vérifier si le vaccin est périmé
                    const isExpired = vaccine.Date_peremption ? new Date(vaccine.Date_peremption) < today : false;
                    
                    // Vérifier si le stock est épuisé
                    const isOutOfStock = vaccine.Stock <= 0;
                    
                    return {
                        total: acc.total + 1,
                        expired: acc.expired + (isExpired ? 1 : 0),
                        outOfStock: acc.outOfStock + (!isExpired && isOutOfStock ? 1 : 0),
                        inStock: acc.inStock + (!isExpired && !isOutOfStock ? 1 : 0)
                    };
                }, { total: 0, inStock: 0, outOfStock: 0, expired: 0 } as VaccineStats);
                
                setStats(vaccineStats);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => setLoading(false)); // Fin du chargement
    }, []);

    const handleDetailsClick = (vaccine: Vaccine) => {
        setSelectedVaccine(vaccine);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedVaccine(null);
    };
    
    // Filtrer les vaccins en fonction du terme de recherche
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data;
        
        const searchTermLower = searchTerm.toLowerCase();
        return data.filter(vaccine => 
            vaccine.Nom.toLowerCase().includes(searchTermLower) ||
            vaccine.Lot.toLowerCase().includes(searchTermLower) ||
            vaccine.Description.toLowerCase().includes(searchTermLower)
        );
    }, [data, searchTerm]);

    return (
        <div className=" flex flex-col items-center">
            {/* Barre de recherche */}
            <div className="w-full max-w-md mb-6 rounded-full">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Rechercher un vaccin par nom, lot ou description..."
                        className="pl-9 border-gray-300 focus:border-blue-500 rounded-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            {/* Statistiques des vaccins */}
            {!loading && data.length > 0 && (
                <div className="w-full max-w-6xl mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <div className="p-3 rounded-full bg-blue-100 mr-4">
                                <Database className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Total vaccins</p>
                                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center bg-green-50 border border-green-100 rounded-lg p-4">
                            <div className="p-3 rounded-full bg-green-100 mr-4">
                                <PackageCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-green-700 font-medium">Vaccins disponibles</p>
                                <p className="text-2xl font-bold text-green-800">{stats.inStock}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center bg-red-50 border border-red-100 rounded-lg p-4">
                            <div className="p-3 rounded-full bg-red-100 mr-4">
                                <PackageX className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-red-700 font-medium">Vaccins épuisés</p>
                                <p className="text-2xl font-bold text-red-800">{stats.outOfStock}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center bg-amber-50 border border-amber-100 rounded-lg p-4">
                            <div className="p-3 rounded-full bg-amber-100 mr-4">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-amber-700 font-medium">Vaccins périmés</p>
                                <p className="text-2xl font-bold text-amber-800">{stats.expired}</p>
                            </div>
                        </div>
                    </div>
                </div>
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
                        <CardTitle className="text-gray-600">Aucun vaccin trouvé</CardTitle>
                        <p className="text-gray-500">Ajoutez un nouveau vaccin pour commencer.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {filteredData.length === 0 && searchTerm && (
                        <div className="w-full flex justify-center mb-6">
                            <Card className="w-full max-w-md p-4 text-center">
                                <CardContent className="flex flex-col items-center pt-4">
                                    <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                                    <p className="text-gray-700">Aucun vaccin ne correspond à votre recherche</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-9">
                        {filteredData.map((vaccine) => (
                            <VaccineCard 
                                key={vaccine.id}
                                vaccine={vaccine}
                                onDetailsClick={handleDetailsClick}
                            />
                        ))}
                    </div>
                </>
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
