import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AddVaccine() {
    const [formData, setFormData] = useState({
        Nom: '',
        Duree: '',
        Date_arrivee: '',
        Date_peremption: '',
        Description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Données envoyées au backend:', formData);

        try {
            const response = await fetch('http://localhost:3000/api/vaccins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Vaccin ajouté avec succès');
                setFormData({ Nom: '', Duree: '', Date_arrivee: '', Date_peremption: '', Description: '' });
                window.location.reload();
            } else {
                console.error('Erreur lors de l’ajout du vaccin');
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-4">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                La liste des Vaccins
            </h1>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                        Ajouter un vaccin <CiCirclePlus className="text-xl" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ajouter un vaccin</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            <Label>Nom</Label>
                            <Input type="text" name="Nom" value={formData.Nom} onChange={handleChange} required />

                            <Label>Durée antigène</Label>
                            <Input type="text" name="Duree" value={formData.Duree} onChange={handleChange} required />

                            <Label>Date d'arrivée</Label>
                            <Input type="date" name="Date_arrivee" value={formData.Date_arrivee} onChange={handleChange} required />

                            <Label>Date de péremption</Label>
                            <Input type="date" name="Date_peremption" value={formData.Date_peremption} onChange={handleChange} required />

                            <Label>Description</Label>
                            <Input type="text" name="Description" value={formData.Description} onChange={handleChange} required />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
