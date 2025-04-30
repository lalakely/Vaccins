import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function HameauAdd() {
    const [formData, setFormData] = useState({
        Nom: '',
        px: '',
        py: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Données envoyées au backend:', formData);

        try {
            const response = await fetch('http://localhost:3000/api/hameau', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Hameau ajouté avec succès');
                setFormData({ Nom: '', px: '', py: '' });
                window.location.reload();
            } else {
                console.error('Erreur lors de l’ajout du hameau');
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-4">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                La liste des hameaux
            </h1>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                        Ajouter un hameau <CiCirclePlus className="text-xl" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ajouter un hameau</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            <Label>Nom</Label>
                            <Input type="text" name="Nom" value={formData.Nom} onChange={handleChange} required />

                            <Label>Px</Label>
                            <Input type="text" name="px" value={formData.px} onChange={handleChange} required />

                            <Label>Py</Label>
                            <Input type="text" name="py" value={formData.py} onChange={handleChange} required />
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
