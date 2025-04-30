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
        <div className="w-full flex flex-col items-center p-4 sm:p-6 ">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800 flex items-center gap-2">
                <FaUser className="text-gray-600" /> Liste des personnes
            </h1>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-gray-700 text-white hover:bg-gray-800 transition-colors shadow-md px-4 py-2 rounded-lg">
                        Ajouter une personne <CiCirclePlus className="text-xl" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-4xl bg-white p-4 sm:p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FaUserTie className="text-gray-600" /> Ajouter un enfant
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Colonne 1 */}
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaUser className="text-gray-600" /> Nom
                                </Label>
                                <Input 
                                    type="text" 
                                    name="Nom" 
                                    value={formData.Nom} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 bg-white border-gray-300 hover:border-gray-500 focus:ring-gray-400 text-black rounded-lg shadow-sm" 
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaUser className="text-gray-600" /> Prénom
                                </Label>
                                <Input 
                                    type="text" 
                                    name="Prenom" 
                                    value={formData.Prenom} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 bg-white border-gray-300 hover:border-gray-500 focus:ring-gray-400 text-black rounded-lg shadow-sm" 
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaIdBadge className="text-gray-600" /> CODE
                                </Label>
                                <Input 
                                    type="number" 
                                    name="CODE" 
                                    value={formData.CODE} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 bg-white border-gray-300 hover:border-gray-500 focus:ring-gray-400 text-black rounded-lg shadow-sm" 
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaCalendarAlt className="text-gray-600" /> Date de naissance
                                </Label>
                                <Input 
                                    type="date" 
                                    name="date_naissance" 
                                    value={formData.date_naissance} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 bg-white border-gray-300 hover:border-gray-500 focus:ring-gray-400 text-black rounded-lg shadow-sm" 
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaVenusMars className="text-gray-600" /> Sexe
                                </Label>
                                <Select 
                                    onValueChange={(value) => setFormData({ ...formData, SEXE: value })} 
                                    required
                                >
                                    <SelectTrigger className="mt-1 bg-white border-gray-300 hover:border-gray-500 text-black rounded-lg shadow-sm">
                                        <SelectValue placeholder="Sélectionnez le sexe" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200">
                                        <SelectItem value="M" className="text-black hover:bg-gray-100 hover:text-gray-900 transition-colors">Masculin</SelectItem>
                                        <SelectItem value="F" className="text-black hover:bg-gray-100 hover:text-gray-900 transition-colors">Féminin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Colonne 2 */}
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaUserTie className="text-gray-600" /> Nom de la mère
                                </Label>
                                <Input 
                                    type="text" 
                                    name="NomMere" 
                                    value={formData.NomMere} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 bg-white border-gray-300 hover:border-gray-500 focus:ring-gray-400 text-black rounded-lg shadow-sm" 
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaUserTie className="text-gray-600" /> Nom du père
                                </Label>
                                <Input 
                                    type="text" 
                                    name="NomPere" 
                                    value={formData.NomPere} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 bg-white border-gray-300 hover:border-gray-500 focus:ring-gray-400 text-black rounded-lg shadow-sm" 
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaHome className="text-gray-600" /> Domicile
                                </Label>
                                <Input 
                                    type="text" 
                                    name="Domicile" 
                                    value={formData.Domicile} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 bg-white border-gray-300 hover:border-gray-500 focus:ring-gray-400 text-black rounded-lg shadow-sm" 
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaPhone className="text-gray-600" /> Téléphone
                                </Label>
                                <Input 
                                    type="text" 
                                    name="Telephone" 
                                    value={formData.Telephone} 
                                    onChange={handleChange} 
                                    className="mt-1 bg-white border-gray-300 hover:border-gray-500 focus:ring-gray-400 text-black rounded-lg shadow-sm" 
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-gray-600" /> Fokotany
                                </Label>
                                <Popover open={openFokotany} onOpenChange={setOpenFokotany}>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            role="combobox" 
                                            className="mt-1 w-full justify-between bg-white border-gray-300 hover:border-gray-500 text-black rounded-lg shadow-sm"
                                        >
                                            {formData.Fokotany || "Sélectionnez un fokotany"}
                                            <ChevronsUpDown className="opacity-50 h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 bg-white border-gray-200">
                                        <Command>
                                            <CommandInput placeholder="Rechercher un fokotany..." className="border-gray-300" />
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
                                                            className="text-black hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                                        >
                                                            {f.Nom}
                                                            <Check className={`ml-auto h-4 w-4 ${formData.Fokotany === f.Nom ? 'opacity-100' : 'opacity-0'}`} />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-gray-600" /> Hameau
                                </Label>
                                <Popover open={openHameau} onOpenChange={setOpenHameau}>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            role="combobox" 
                                            className="mt-1 w-full justify-between bg-white border-gray-300 hover:border-gray-500 text-black rounded-lg shadow-sm"
                                        >
                                            {formData.Hameau || "Sélectionnez un hameau"}
                                            <ChevronsUpDown className="opacity-50 h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 bg-white border-gray-200">
                                        <Command>
                                            <CommandInput placeholder="Rechercher un hameau..." className="border-gray-300" />
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
                                                            className="text-black hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                                        >
                                                            {h.Nom}
                                                            <Check className={`ml-auto h-4 w-4 ${formData.Hameau === h.Nom ? 'opacity-100' : 'opacity-0'}`} />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Bouton Enregistrer */}
                        <div className="col-span-1 sm:col-span-2 flex justify-end space-x-3">
                            <Button 
                                type="submit" 
                                className="bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md px-6 py-2 rounded-lg"
                            >
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}