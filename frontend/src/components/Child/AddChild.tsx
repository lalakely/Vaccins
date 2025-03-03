import { useState, useEffect } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaUser, FaIdBadge, FaCalendarAlt, FaVenusMars, FaHome, FaPhone, FaUserTie, FaMapMarkerAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import axios from "axios";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

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

    const [fokotanyList, setFokotanyList] = useState([]);
    const [hameauList, setHameauList] = useState([]);
    const [openFokotany, setOpenFokotany] = useState(false);
    const [openHameau, setOpenHameau] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:3000/api/fokotany").then((response) => {
            setFokotanyList(response.data);
        });
        axios.get("http://localhost:3000/api/hameau").then((response) => {
            setHameauList(response.data);
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = {
            ...formData,
            age_premier_contact: formData.age_premier_contact.trim() === "" ? 0 : parseInt(formData.age_premier_contact, 10),
        };

        console.log('Données envoyées au backend :', formDataToSend);

        try {
            const response = await fetch('http://localhost:3000/api/enfants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formDataToSend),
            });

            const responseData = await response.json();
            console.log("Réponse du serveur :", response.status, responseData);

            if (response.ok) {
                console.log('Enfant ajouté avec succès');
                setFormData({
                    Nom: '', Prenom: '', CODE: '', date_naissance: '', age_premier_contact: '',
                    SEXE: '', NomMere: '', NomPere: '', Domicile: '', Fokotany: '', Hameau: '', Telephone: ''
                });
                window.location.reload();
            } else {
                console.error('Erreur lors de l’ajout de l’enfant :', responseData.message);
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
                        <div className="space-y-3">
                            <Label>
                                <FaUser className="inline mr-2" /> Nom
                            </Label>
                            <Input type="text" name="Nom" value={formData.Nom} onChange={handleChange} required />

                            <Label>
                                <FaUser className="inline mr-2" /> Prénom
                            </Label>
                            <Input type="text" name="Prenom" value={formData.Prenom} onChange={handleChange} required />

                            <Label>
                                <FaIdBadge className="inline mr-2" /> CODE
                            </Label>
                            <Input type="number" name="CODE" value={formData.CODE} onChange={handleChange} required />

                            <Label>
                                <FaCalendarAlt className="inline mr-2" /> Date de naissance
                            </Label>
                            <Input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required />

                            <Label>
                                <FaVenusMars className="inline mr-2" /> Sexe
                            </Label>
                            <Select onValueChange={(value) => setFormData({ ...formData, SEXE: value })} required>
                                <SelectTrigger className="text-black hover:text-black">
                                    <SelectValue placeholder="Sélectionnez le sexe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="M" className="text-black hover:text-black">Masculin</SelectItem>
                                    <SelectItem value="F" className="text-black hover:text-black">Féminin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>
                                <FaUserTie className="inline mr-2" /> Nom de la mère
                            </Label>
                            <Input type="text" name="NomMere" value={formData.NomMere} onChange={handleChange} required />

                            <Label>
                                <FaUserTie className="inline mr-2" /> Nom du père
                            </Label>
                            <Input type="text" name="NomPere" value={formData.NomPere} onChange={handleChange} required />

                            <Label>
                                <FaHome className="inline mr-2" /> Domicile
                            </Label>
                            <Input type="text" name="Domicile" value={formData.Domicile} onChange={handleChange} required />

                            <Label>
                                <FaPhone className="inline mr-2" /> Téléphone
                            </Label>
                            <Input type="text" name="Telephone" value={formData.Telephone} onChange={handleChange} />

                            <Label>
                                <FaMapMarkerAlt className="inline mr-2" /> Fokotany
                            </Label>
                            <Popover open={openFokotany} onOpenChange={setOpenFokotany}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between text-black hover:text-black">
                                        {formData.Fokotany || "Sélectionnez un fokotany"}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher un fokotany..." />
                                        <CommandList>
                                            <CommandEmpty>Aucun fokotany trouvé.</CommandEmpty>
                                            <CommandGroup>
                                                {fokotanyList.map((f, index) => (
                                                    <CommandItem
                                                        key={f.ID || `fokotany-${index}`}
                                                        onSelect={() => {
                                                            setFormData({ ...formData, Fokotany: f.Nom });
                                                            setOpenFokotany(false);
                                                        }}
                                                        className="text-black hover:text-black"
                                                    >
                                                        {f.Nom}
                                                        <Check className={`ml-auto ${formData.Fokotany === f.Nom ? 'opacity-100' : 'opacity-0'}`} />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <Label>
                                <FaMapMarkerAlt className="inline mr-2" /> Hameau
                            </Label>
                            <Popover open={openHameau} onOpenChange={setOpenHameau}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between text-black hover:text-black">
                                        {formData.Hameau || "Sélectionnez un hameau"}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher un hameau..." />
                                        <CommandList>
                                            <CommandEmpty>Aucun hameau trouvé.</CommandEmpty>
                                            <CommandGroup>
                                                {hameauList.map((h, index) => (
                                                    <CommandItem
                                                        key={h.id || `hameau-${index}`}
                                                        onSelect={() => {
                                                            setFormData({ ...formData, Hameau: h.Nom });
                                                            setOpenHameau(false);
                                                        }}
                                                        className="text-black hover:text-black"
                                                    >
                                                        {h.Nom}
                                                        <Check className={`ml-auto ${formData.Hameau === h.Nom ? 'opacity-100' : 'opacity-0'}`} />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
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
