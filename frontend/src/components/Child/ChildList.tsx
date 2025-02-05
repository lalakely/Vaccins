import axios from "axios";
import { useEffect, useState } from "react";
import ChildRow from "./ChildRow";
import ChildDetailsPopup from "./ChildDetailsPopup";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react"; // Icônes pour chargement et liste vide

export default function ChildList() {
    const [data, setData] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true); // Ajout de l'état de chargement

    useEffect(() => {
        axios.get("http://localhost:3000/api/enfants")
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            })
            .finally(() => setLoading(false)); // Fin du chargement
    }, []);

    const handleDetailsClick = (enfant) => {
        setSelectedChild(enfant);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedChild(null);
    };

    return (
        <div className="flex flex-col items-center p-6">
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
                        <CardTitle className="text-gray-600">Aucun enfant trouvé</CardTitle>
                        <p className="text-gray-500">Ajoutez un nouvel enfant pour commencer.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="overflow-x-auto shadow-md rounded-lg border border-gray-200 w-full max-w-4xl">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-200">
                                <TableHead>Nom</TableHead>
                                <TableHead>Prénom</TableHead>
                                <TableHead>Date de Naissance</TableHead>
                                <TableHead>Domicile</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((enfant, index) => (
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
            )}

            <Dialog open={showPopup} onOpenChange={setShowPopup}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Détails de l'enfant</DialogTitle>
                    </DialogHeader>
                    {selectedChild && <ChildDetailsPopup enfant={selectedChild} onClose={closePopup} />}
                    <Button variant="outline" onClick={closePopup}>
                        Fermer
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
