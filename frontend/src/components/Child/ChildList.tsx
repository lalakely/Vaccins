import axios from "axios";
import { useEffect, useState } from "react";
import ChildRow from "./ChildRow";
import ChildDetailsPopup from "./ChildDetailsPopup";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Loader2, Users, UserPlus, Home, Calendar, Info } from "lucide-react";

export default function ChildList() {
    const [data, setData] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✅ États pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Nombre d'éléments par page

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

    // ✅ Gestion de la pagination
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="p-6 flex flex-col items-center pt-[70px] overflow-y-auto w-full">
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
                    <Card className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 w-full max-w-4xl mx-auto">
                        <Table className="w-full text-base min-w-full">
                            <TableHeader>
                                <TableRow className="bg-gray-100 text-gray-700">
                                    <TableHead className="font-medium p-3 text-center"><Users className="inline-block mr-1 w-4 h-4" />Nom</TableHead>
                                    <TableHead className="font-medium p-3 text-center"><UserPlus className="inline-block mr-1 w-4 h-4" />Prénom</TableHead>
                                    <TableHead className="font-medium p-3 text-center"><Calendar className="inline-block mr-1 w-4 h-4" />Date de Naissance</TableHead>
                                    <TableHead className="font-medium p-3 text-center"><Home className="inline-block mr-1 w-4 h-4" />Domicile</TableHead>
                                    <TableHead className="font-medium p-3 text-center"><Info className="inline-block mr-1 w-4 h-4" />Actions</TableHead>
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
                </>
            )}

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
