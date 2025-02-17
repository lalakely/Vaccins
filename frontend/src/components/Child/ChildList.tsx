import axios from "axios";
import { useEffect, useState } from "react";
import ChildRow from "./ChildRow";
import ChildDetailsPopup from "./ChildDetailsPopup";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Loader2, Users, UserPlus, Home, Calendar, Info, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FaUser, FaUserPlus, FaBarcode, FaCalendarAlt, FaVenusMars, FaHome, FaPhone, FaUserTie, FaUserFriends } from 'react-icons/fa';

export default function ChildList() {
    const [data, setData] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        Nom: '',
        Prenom: '',
        CODE: '',
        date_naissance: '',
        SEXE: '',
        NomMere: '',
        NomPere: '',
        Domicile: '',
        Fokotany: '',
        Hameau: '',
        Telephone: ''
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // ✅ États pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        axios.get("http://localhost:3000/api/enfants")
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDetailsClick = (enfant) => {
        setSelectedChild(enfant);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedChild(null);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const filteredData = data.filter(enfant => {
        return Object.keys(filters).every(key => {
            if (filters[key] === '') return true;
            return String(enfant[key]).toLowerCase().includes(filters[key].toLowerCase());
        });
    });

    // ✅ Gestion de la pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className={`p-6 flex flex-col items-center pt-[70px] overflow-y-auto w-full relative transition-all duration-300 ${isFilterOpen ? 'pr-[320px]' : ''}`}>
            {loading ? (
                <Card className="flex flex-col items-center justify-center w-full max-w-xl p-6 text-center shadow-lg mx-auto">
                    <CardHeader>
                        <Loader2 className="w-12 h-12 text-gray-500 animate-spin mx-auto" />
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-gray-600 text-lg">Chargement en cours...</CardTitle>
                        <p className="text-gray-500 text-sm">Veuillez patienter.</p>
                    </CardContent>
                </Card>
            ) : data.length === 0 ? (
                <Card className="flex flex-col items-center justify-center w-full max-w-xl p-6 text-center shadow-lg mx-auto">
                    <CardHeader>
                        <AlertCircle className="w-12 h-12 text-gray-500 mx-auto" />
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-gray-600 text-lg">Aucun enfant trouvé</CardTitle>
                        <p className="text-gray-500 text-sm">Ajoutez un nouvel enfant pour commencer.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 w-full max-w-4xl min-w-[800px] mx-auto">
                        <Table className="w-full text-base min-w-full min-w-[800px]">
                            <TableHeader>
                                <TableRow className="bg-gray-100 text-gray-700">
                                    <TableHead className="font-medium p-3 text-center">
                                        <Users className="inline-block mr-1 w-4 h-4" />Nom
                                    </TableHead>
                                    <TableHead className="font-medium p-3 text-center">
                                        <UserPlus className="inline-block mr-1 w-4 h-4" />Prénom
                                    </TableHead>
                                    <TableHead className="font-medium p-3 text-center">
                                        <Calendar className="inline-block mr-1 w-4 h-4" />Date de Naissance
                                    </TableHead>
                                    <TableHead className="font-medium p-3 text-center">
                                        <Home className="inline-block mr-1 w-4 h-4" />Domicile
                                    </TableHead>
                                    <TableHead className="font-medium p-3 text-center">
                                        <Info className="inline-block mr-1 w-4 h-4" />Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentItems.map((enfant, index) => (
                                    <ChildRow
                                        key={enfant.id}
                                        enfant={enfant}
                                        isEven={index % 2 === 0}
                                        onDetailsClick={handleDetailsClick}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </>
            )}

            {/* ✅ Pagination */}
            <div className="flex items-center gap-4 mt-4">
                <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Précédent
                </Button>
                <span className="text-gray-700">
                    Page {currentPage} sur {totalPages}
                </span>
                <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Suivant
                </Button>
            </div>

            {/* ✅ Filter Button repositionné */}
            <Button
                variant="outline"
               
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`fixed top-1/2 right-4 transform -translate-y-1/2 bg-white border border-gray-300 text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-200 transition-all z-50
                    ${isFilterOpen ? "right-[320px]" : "right-[15px]"}`}
            >
                <Filter className="w-4 h-4" />
            </Button>

            {/* ✅ Filter Drawer ajusté */}
            <div className={`fixed top-0 right-0 h-full w-[300px] p-4 bg-white shadow-lg flex flex-col justify-center transform transition-transform z-40 ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-2">
                        <FaUser className="text-gray-500" />
                        Nom:
                        <input type="text" className="border p-2 w-full rounded" value={filters.Nom} onChange={(e) => setFilters({ ...filters, Nom: e.target.value })} />
                    </label>
                    <label className="flex items-center gap-2">
                        <FaUserPlus className="text-gray-500" />
                        Prénom:
                        <input type="text" className="border p-2 w-full rounded" value={filters.Prenom} onChange={(e) => setFilters({ ...filters, Prenom: e.target.value })} />
                    </label>
                    <label className="flex items-center gap-2">
                        <FaBarcode className="text-gray-500" />
                        CODE:
                        <input type="text" className="border p-2 w-full rounded" value={filters.CODE} onChange={(e) => setFilters({ ...filters, CODE: e.target.value })} />
                    </label>
                    <label className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500" />
                        Date de Naissance:
                        <input type="date" className="border p-2 w-full rounded" value={filters.date_naissance} onChange={(e) => setFilters({ ...filters, date_naissance: e.target.value })} />
                    </label>
                    <label className="flex items-center gap-2">
                        <FaUserFriends className="text-gray-500" />
                        Age Premier Contact:
                        <input type="number" className="border p-2 w-full rounded" value={filters.age_premier_contact} onChange={(e) => setFilters({ ...filters, age_premier_contact: e.target.value })} />
                    </label>
                    <label className="flex items-center gap-2">
                        <FaVenusMars className="text-gray-500" />
                        Sexe:
                        <select className="border p-2 w-full rounded" value={filters.SEXE} onChange={(e) => setFilters({ ...filters, SEXE: e.target.value })}>
                            <option value="">Sélectionner</option>
                            <option value="M">M</option>
                            <option value="F">F</option>
                        </select>
                    </label>
                    <label className="flex items-center gap-2">
                        <FaUserTie className="text-gray-500" />
                        Nom de la Mère:
                        <input type="text" className="border p-2 w-full rounded" value={filters.NomMere} onChange={(e) => setFilters({ ...filters, NomMere: e.target.value })} />
                    </label>
                    <label className="flex items-center gap-2">
                        <FaUserTie className="text-gray-500" />
                        Nom du Père:
                        <input type="text" className="border p-2 w-full rounded" value={filters.NomPere} onChange={(e) => setFilters({ ...filters, NomPere: e.target.value })} />
                    </label>
                    <label className="flex items-center gap-2">
                        <FaHome className="text-gray-500" />
                        Domicile:
                        <input type="text" className="border p-2 w-full rounded" value={filters.Domicile} onChange={(e) => setFilters({ ...filters, Domicile: e.target.value })} />
                    </label>
                    <label className="flex items-center gap-2">
                        <FaHome className="text-gray-500" />
                        Fokotany:
                        <input type="text" className="border p-2 w-full rounded" value={filters.Fokotany} onChange={(e) => setFilters({ ...filters, Fokotany: e.target.value })} />
                    </label>
                    <label className="flex items-center gap-2">
                        <FaHome className="text-gray-500" />
                        Hameau:
                        <input type="text" className="border p-2 w-full rounded" value={filters.Hameau} onChange={(e) => setFilters({ ...filters, Hameau: e.target.value })} />
                    </label>
                    <label className="flex items-center gap-2">
                        <FaPhone className="text-gray-500" />
                        Téléphone:
                        <input type="text" className="border p-2 w-full rounded" value={filters.Telephone} onChange={(e) => setFilters({ ...filters, Telephone: e.target.value })} />
                    </label>
                </div>
            </div>

            <Dialog open={showPopup} onOpenChange={setShowPopup}>
                <DialogContent className="max-w-lg p-5 space-y-4 bg-white shadow-xl rounded-lg mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-center">Détails de l'enfant</DialogTitle>
                    </DialogHeader>
                    {selectedChild && <ChildDetailsPopup enfant={selectedChild} onClose={closePopup} />}
                    <Button variant="outline" onClick={closePopup} className="w-full text-sm">
                        Fermer
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
