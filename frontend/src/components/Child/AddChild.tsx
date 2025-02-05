import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AddChild() {
    const [formData, setFormData] = useState({
        Nom: '',
        Prenom: '',
        CODE: '',
        date_naissance: '',
        age_premier_contact: '',
        SEXE: '',
        NomMere: '',
        NomPere: '',
        Domicile: '',
        Fokotany: '',
        Hameau: '',
        Telephone: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Vérifier si age_premier_contact est vide et le remplacer par 0
        const formDataToSend = {
            ...formData,
            age_premier_contact: formData.age_premier_contact.trim() === "" ? 0 : parseInt(formData.age_premier_contact, 10),
        };
    
        console.log('Données envoyées vers le backend :', formDataToSend);
    
        try {
            const response = await fetch('http://localhost:3000/api/enfants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formDataToSend),
            });
    
            if (response.ok) {
                console.log('Enfant ajouté avec succès');
                setFormData({
                    Nom: '',
                    Prenom: '',
                    CODE: '',
                    date_naissance: '',
                    age_premier_contact: '',
                    SEXE: '',
                    NomMere: '',
                    NomPere: '',
                    Domicile: '',
                    Fokotany: '',
                    Hameau: '',
                    Telephone: ''
                });
                window.location.reload();
            } else {
                console.error('Erreur lors de l’ajout de l’enfant');
            }
        } catch (error) {
            console.error('Erreur réseau :', error);
        }
    };
    

    return (
        <div className="w-full flex flex-col items-center p-4">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Liste des personnes</h1>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                        Ajouter une personne <CiCirclePlus className="text-xl" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Ajouter un enfant</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Partie Gauche */}
                        <div className="space-y-3">
                            <Label>Nom</Label>
                            <Input type="text" name="Nom" value={formData.Nom} onChange={handleChange} required />

                            <Label>Prénom</Label>
                            <Input type="text" name="Prenom" value={formData.Prenom} onChange={handleChange} required />

                            <Label>CODE</Label>
                            <Input type="number" name="CODE" value={formData.CODE} onChange={handleChange} required />

                            <Label>Date de naissance</Label>
                            <Input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required />

                            <Label>Sexe</Label>
                            <Select onValueChange={(value) => setFormData({ ...formData, SEXE: value })} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez le sexe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M">Masculin</SelectItem>
                                    <SelectItem value="F">Féminin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Partie Droite */}
                        <div className="space-y-3">
                            <Label>Nom de la mère</Label>
                            <Input type="text" name="NomMere" value={formData.NomMere} onChange={handleChange} required />

                            <Label>Nom du père</Label>
                            <Input type="text" name="NomPere" value={formData.NomPere} onChange={handleChange} required />

                            <Label>Domicile</Label>
                            <Input type="text" name="Domicile" value={formData.Domicile} onChange={handleChange} required />

                            <Label>Fokotany</Label>
                            <Input type="text" name="Fokotany" value={formData.Fokotany} onChange={handleChange} />

                            <Label>Hameau</Label>
                            <Input type="text" name="Hameau" value={formData.Hameau} onChange={handleChange} />

                            <Label>Téléphone</Label>
                            <Input type="text" name="Telephone" value={formData.Telephone} onChange={handleChange} />
                        </div>

                        {/* Boutons */}
                        <div className="col-span-2 flex justify-end space-x-3">
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
