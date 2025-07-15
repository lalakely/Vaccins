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
import { formStyles } from "@/components/ui/form-styles";

export default function AddChild() {
    const [formData, setFormData] = useState({
        Nom: "",
        Prenom: "",
        CODE: "",
        date_naissance: "",
        age_premier_contact: "",
        SEXE: "",
        NomMere: "",
        NomPere: "",
        Domicile: "",
        Fokotany: "",
        Hameau: "",
        Telephone: ""
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [fokotanyList, setFokotanyList] = useState<Array<{ID?: string, Nom: string}>>([]);
    const [hameauList, setHameauList] = useState<Array<{ID?: string, Nom: string}>>([]);
    const [openFokotany, setOpenFokotany] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:3000/api/enfants", formData);
            if (response.status === 201) {
                setSuccessMessage("Enfant ajouté avec succès.");
                setFormData({
                    Nom: "",
                    Prenom: "",
                    CODE: "",
                    date_naissance: "",
                    age_premier_contact: "",
                    SEXE: "",
                    NomMere: "",
                    NomPere: "",
                    Domicile: "",
                    Fokotany: "",
                    Hameau: "",
                    Telephone: ""
                });
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'enfant :", error);
            setErrorMessage("Une erreur est survenue lors de l'ajout de l'enfant.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800 flex items-center gap-2">
                <FaUser className="text-gray-600" /> Liste des personnes
            </h1>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className={`${formStyles.primaryButton} px-6 max-w-xs rounded-full`}>
                        Ajouter une personne <CiCirclePlus className="text-xl ml-1" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-4xl bg-white p-4 sm:p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-50 border border-blue-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FaUserTie className="text-gray-600" /> Ajouter un enfant
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                        {/* Colonne 1 */}
                        <div className="space-y-4">
                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaUser className="text-gray-500" /> Nom
                                </Label>
                                <div className={formStyles.inputWrapper}>
                                    <Input 
                                        type="text" 
                                        name="Nom" 
                                        value={formData.Nom} 
                                        onChange={handleChange} 
                                        required 
                                        className={formStyles.input}
                                        placeholder="Entrez le nom" 
                                    />
                                    <span className={formStyles.inputIcon}>
                                        <FaUser />
                                    </span>
                                </div>
                            </div>

                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaUser className="text-gray-500" /> Prénom
                                </Label>
                                <div className={formStyles.inputWrapper}>
                                    <Input 
                                        type="text" 
                                        name="Prenom" 
                                        value={formData.Prenom} 
                                        onChange={handleChange} 
                                        required 
                                        className={formStyles.input} 
                                        placeholder="Entrez le prénom"
                                    />
                                    <span className={formStyles.inputIcon}>
                                        <FaUser />
                                    </span>
                                </div>
                            </div>

                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaIdBadge className="text-gray-500" /> CODE
                                </Label>
                                <div className={formStyles.inputWrapper}>
                                    <Input 
                                        type="number" 
                                        name="CODE" 
                                        value={formData.CODE} 
                                        onChange={handleChange} 
                                        required 
                                        className={formStyles.input} 
                                        placeholder="Entrez le code"
                                    />
                                    <span className={formStyles.inputIcon}>
                                        <FaIdBadge />
                                    </span>
                                </div>
                            </div>

                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaCalendarAlt className="text-gray-500" /> Date de naissance
                                </Label>
                                <div className={formStyles.inputWrapper}>
                                    <Input 
                                        type="date" 
                                        name="date_naissance" 
                                        value={formData.date_naissance} 
                                        onChange={handleChange} 
                                        required 
                                        className={formStyles.input}
                                    />
                                    <span className={formStyles.inputIcon}>
                                        <FaCalendarAlt />
                                    </span>
                                </div>
                            </div>

                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaVenusMars className="text-gray-500" /> Sexe
                                </Label>
                                <Select 
                                    onValueChange={(value) => setFormData({ ...formData, SEXE: value })} 
                                    required
                                >
                                    <SelectTrigger className={formStyles.selectTrigger}>
                                        <SelectValue placeholder="Sélectionnez le sexe" />
                                    </SelectTrigger>
                                    <SelectContent className={formStyles.selectContent}>
                                        <SelectItem value="M" className={formStyles.selectItem}>Masculin</SelectItem>
                                        <SelectItem value="F" className={formStyles.selectItem}>Féminin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Colonne 2 */}
                        <div className="space-y-4">
                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaHome className="text-blue-500" /> Localité
                                </Label>
                                <Select 
                                    onValueChange={(value) => setFormData({ ...formData, Hameau: value })} 
                                    required
                                >
                                    <SelectTrigger className={formStyles.selectTrigger}>
                                        <SelectValue placeholder="Sélectionnez la localité" />
                                    </SelectTrigger>
                                    <SelectContent className={formStyles.selectContent}>
                                        {hameauList.map((h, index) => (
                                            <SelectItem 
                                                key={h.ID || `hameau-${index}`} 
                                                value={h.Nom} 
                                                className={formStyles.selectItem}
                                            >
                                                {h.Nom}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

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

                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaPhone className="text-gray-500" /> Téléphone
                                </Label>
                                <div className={formStyles.inputWrapper}>
                                    <Input 
                                        type="tel" 
                                        name="Telephone" 
                                        value={formData.Telephone} 
                                        onChange={handleChange} 
                                        className={formStyles.input}
                                        placeholder="Entrez le numéro de téléphone" 
                                    />
                                    <span className={formStyles.inputIcon}>
                                        <FaPhone />
                                    </span>
                                </div>
                            </div>

                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaMapMarkerAlt className="text-gray-500" /> Fokotany
                                </Label>
                                <Popover open={openFokotany} onOpenChange={setOpenFokotany}>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            role="combobox" 
                                            className={formStyles.popoverTrigger}
                                        >
                                            {formData.Fokotany || "Sélectionnez un fokotany"}
                                            <ChevronsUpDown className="opacity-70 h-4 w-4 ml-2" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className={formStyles.popoverContent}>
                                        <Command className="rounded-lg">
                                            <CommandInput placeholder="Rechercher un fokotany..." className="border-none focus:ring-0" />
                                            <CommandList>
                                                <CommandEmpty className="py-6 text-center text-sm text-gray-500">Aucun fokotany trouvé.</CommandEmpty>
                                                <CommandGroup>
                                                    {fokotanyList.map((f, index) => (
                                                        <CommandItem
                                                            key={index}
                                                            value={f.Nom}
                                                            onSelect={() => {
                                                                setFormData({ ...formData, Fokotany: f.Nom });
                                                                setOpenFokotany(false);
                                                            }}
                                                            className="px-2 py-1.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md my-0.5 mx-1 cursor-pointer"
                                                        >
                                                            <Check
                                                                className={`mr-2 h-4 w-4 ${formData.Fokotany === f.Nom ? "opacity-100 text-gray-600" : "opacity-0"}`}
                                                            />
                                                            {f.Nom}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row justify-end gap-4 mt-8">
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                className={formStyles.successButton}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enregistrement...
                                    </>
                                ) : (
                                    "Enregistrer"
                                )}
                            </Button>
                        </div>
                        
                        {errorMessage && (
                            <div className={formStyles.errorContainer + " col-span-1 sm:col-span-2"}>
                                {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className={formStyles.successContainer + " col-span-1 sm:col-span-2"}>
                                {successMessage}
                            </div>
                        )}
                    </form>
                </DialogContent>
            </Dialog>
            
            <div className="w-full border-t border-gray-200 my-6"></div>
        </div>
    );
}