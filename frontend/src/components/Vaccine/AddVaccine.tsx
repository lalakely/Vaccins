import { useState, useEffect } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { formStyles } from "@/components/ui/form-styles";

interface Vaccine {
    id: number;
    Nom: string;
    Duree: number; // Changé de string à number pour représenter des jours
    Date_arrivee: string;
    Date_peremption: string;
    Description: string;
    Age_Annees?: number;
    Age_Mois?: number;
    Age_Jours?: number;
}

interface Rappel {
    delai: number; // délai en jours après l'administration du vaccin
    description: string;
}

interface PrerequisVaccin {
    id: number;
    strict: boolean;
}

interface SuiteVaccin {
    id: number;
    strict: boolean;
    delai: number;
    type?: 'strict' | 'recommande' | 'rappel'; // Type de suite: strict, recommandé ou rappel
}

export default function AddVaccine() {
    const [formData, setFormData] = useState({
        Nom: '',
        Duree: '', // Sera converti en nombre lors de l'envoi
        Date_arrivee: '',
        Date_peremption: '',
        Description: '',
        PrerequisVaccins: [] as PrerequisVaccin[], // Maintenant un tableau d'objets avec id et strict
        SuiteVaccins: [] as SuiteVaccin[], // Vaccins qui doivent suivre, avec strict et délai
        Age_Annees: '0', // Âge de prescription en années
        Age_Mois: '0', // Âge de prescription en mois
        Age_Jours: '0', // Âge de prescription en jours
        Rappels: [] as Rappel[] // Rappels du vaccin
    });
    
    const [availableVaccines, setAvailableVaccines] = useState<Vaccine[]>([]);
    const [selectedPrerequisites, setSelectedPrerequisites] = useState<PrerequisVaccin[]>([]);
    const [selectedSuites, setSelectedSuites] = useState<SuiteVaccin[]>([]);
    const [rappels, setRappels] = useState<Rappel[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    // Validation spéciale pour le champ Duree (doit être un nombre)
    const handleDureeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // N'accepter que les nombres
        if (value === '' || /^\d+$/.test(value)) {
            setFormData({ ...formData, Duree: value });
        }
    };
    
    const handlePrerequisiteChange = (vaccineId: number) => {
        const newSelectedPrerequisites = [...selectedPrerequisites];
        const existingIndex = newSelectedPrerequisites.findIndex(prereq => prereq.id === vaccineId);
        
        if (existingIndex > -1) {
            newSelectedPrerequisites.splice(existingIndex, 1);
        } else {
            // Ajouter avec strict = false par défaut
            newSelectedPrerequisites.push({ id: vaccineId, strict: false });
        }
        
        setSelectedPrerequisites(newSelectedPrerequisites);
        setFormData({ ...formData, PrerequisVaccins: newSelectedPrerequisites });
    };
    
    // Gérer le changement d'état strict pour un prérequis
    const handleStrictChange = (vaccineId: number, isStrict: boolean) => {
        const newSelectedPrerequisites = [...selectedPrerequisites];
        const prerequisIndex = newSelectedPrerequisites.findIndex(prereq => prereq.id === vaccineId);
        
        if (prerequisIndex > -1) {
            newSelectedPrerequisites[prerequisIndex].strict = isStrict;
            setSelectedPrerequisites(newSelectedPrerequisites);
            setFormData({ ...formData, PrerequisVaccins: newSelectedPrerequisites });
        }
    };
    
    // Gérer les changements pour les vaccins suites
    const handleSuiteChange = (vaccineId: number) => {
        const newSelectedSuites = [...selectedSuites];
        const existingIndex = newSelectedSuites.findIndex(suite => suite.id === vaccineId);
        
        if (existingIndex > -1) {
            newSelectedSuites.splice(existingIndex, 1);
        } else {
            // Ajouter avec strict = false et delai = 0 par défaut
            newSelectedSuites.push({ id: vaccineId, strict: false, delai: 0 });
        }
        
        setSelectedSuites(newSelectedSuites);
        setFormData({ ...formData, SuiteVaccins: newSelectedSuites });
    };
    
    // Gérer le changement d'état strict pour un suite
    const handleSuiteStrictChange = (vaccineId: number, isStrict: boolean) => {
        const newSelectedSuites = [...selectedSuites];
        const suiteIndex = newSelectedSuites.findIndex(suite => suite.id === vaccineId);
        
        if (suiteIndex > -1) {
            newSelectedSuites[suiteIndex].strict = isStrict;
            setSelectedSuites(newSelectedSuites);
            setFormData({ ...formData, SuiteVaccins: newSelectedSuites });
        }
    };
    
    // Gérer le changement du délai pour un suite
    const handleSuiteDelaiChange = (vaccineId: number, delai: string) => {
        const delaiValue = parseInt(delai) || 0;
        const newSelectedSuites = [...selectedSuites];
        const suiteIndex = newSelectedSuites.findIndex(suite => suite.id === vaccineId);
        
        if (suiteIndex > -1) {
            newSelectedSuites[suiteIndex].delai = delaiValue;
            setSelectedSuites(newSelectedSuites);
            setFormData({ ...formData, SuiteVaccins: newSelectedSuites });
        }
    };

    useEffect(() => {
        // Fetch available vaccines when component mounts
        const fetchVaccines = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/vaccins');
                if (response.ok) {
                    const vaccines = await response.json() as Vaccine[];
                    setAvailableVaccines(vaccines);
                } else {
                    console.error('Erreur lors de la récupération des vaccins');
                }
            } catch (error) {
                console.error('Erreur réseau:', error);
            }
        };
        
        fetchVaccines();
    }, []);

    // Fonction pour ajouter un rappel
    const handleAddRappel = () => {
        const newRappel: Rappel = { delai: 0, description: '' };
        const updatedRappels = [...rappels, newRappel];
        setRappels(updatedRappels);
        setFormData({ ...formData, Rappels: updatedRappels });
    };

    // Fonction pour supprimer un rappel
    const handleRemoveRappel = (index: number) => {
        const updatedRappels = rappels.filter((_, i) => i !== index);
        setRappels(updatedRappels);
        setFormData({ ...formData, Rappels: updatedRappels });
    };

    // Fonction pour mettre à jour un rappel
    const handleRappelChange = (index: number, field: keyof Rappel, value: string | number) => {
        const updatedRappels = [...rappels];
        updatedRappels[index] = { ...updatedRappels[index], [field]: value };
        setRappels(updatedRappels);
        setFormData({ ...formData, Rappels: updatedRappels });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            // Convertir les rappels en SuiteVaccins avec type 'rappel'
            const rappelSuites: SuiteVaccin[] = rappels.map(rappel => ({
                id: -1, // ID temporaire, sera remplacé par l'ID du vaccin créé
                strict: true,
                delai: rappel.delai,
                type: 'rappel',
                description: rappel.description
            }));
            
            // Ajouter les types aux SuiteVaccins existants
            const typedSuites = selectedSuites.map(suite => ({
                ...suite,
                type: suite.strict ? 'strict' : 'recommande'
            }));
            
            // Combiner les suites et les rappels
            const allSuites = [...typedSuites, ...rappelSuites];
            
            // Convertir les valeurs en nombres
            const vaccineData = {
                ...formData,
                Duree: parseInt(formData.Duree),
                Age_Annees: parseInt(formData.Age_Annees),
                Age_Mois: parseInt(formData.Age_Mois),
                Age_Jours: parseInt(formData.Age_Jours),
                // Envoyer les objets SuiteVaccins complets
                SuiteVaccins: allSuites,
                // Envoyer aussi les rappels séparément pour compatibilité
                Rappels: rappels
            };

            const response = await fetch('http://localhost:3000/api/vaccins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(vaccineData),
            });

            if (response.ok) {
                console.log('Vaccin ajouté avec succès');
                // Réinitialiser le formulaire
                setFormData({
                    Nom: '',
                    Duree: '',
                    Date_arrivee: '',
                    Date_peremption: '',
                    Description: '',
                    PrerequisVaccins: [],
                    SuiteVaccins: [],
                    Age_Annees: '0',
                    Age_Mois: '0',
                    Age_Jours: '0',
                    Rappels: []
                });
                setSelectedPrerequisites([]);
                setSelectedSuites([]);
                setRappels([]);
                window.location.reload();
            } else {
                console.error('Erreur lors de l\'ajout du vaccin');
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800 flex items-center gap-2">
                <CiCirclePlus className="text-gray-600" /> La liste des Vaccins
            </h1>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className={`${formStyles.primaryButton} px-6 max-w-xs rounded-full`}>
                        Ajouter un vaccin <CiCirclePlus className="text-xl ml-1" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl bg-white p-4 sm:p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-50 border border-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <CiCirclePlus className="text-gray-600" /> Ajouter un vaccin
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Colonne gauche */}
                            <div className="space-y-3">
                                <div className={formStyles.formGroup}>
                                    <Label className={formStyles.label}>Nom</Label>
                                    <div className={formStyles.inputWrapper}>
                                        <Input 
                                            type="text" 
                                            name="Nom" 
                                            value={formData.Nom} 
                                            onChange={handleChange} 
                                            className={formStyles.input}
                                            required 
                                        />
                                        <span className={formStyles.inputIcon}>
                                            <CiCirclePlus />
                                        </span>
                                    </div>
                                </div>

                                <div className={formStyles.formGroup}>
                                    <Label className={formStyles.label}>Durée de l'antigène (en jours)</Label>
                                    <div className={formStyles.inputWrapper}>
                                        <Input 
                                            type="number" 
                                            name="Duree" 
                                            value={formData.Duree} 
                                            onChange={handleDureeChange} 
                                            min="1"
                                            required 
                                            placeholder="Entrez le nombre de jours"
                                            className={formStyles.input}
                                        />
                                        <span className={formStyles.inputIcon}>
                                            <span className="text-sm font-medium">Jours</span>
                                        </span>
                                    </div>
                                </div>

                                <div className={formStyles.formGroup}>
                                    <Label className={formStyles.label}>Date d'arrivée</Label>
                                    <div className={formStyles.inputWrapper}>
                                        <Input 
                                            type="date" 
                                            name="Date_arrivee" 
                                            value={formData.Date_arrivee} 
                                            onChange={handleChange} 
                                            required 
                                            className={formStyles.input}
                                        />
                                    </div>
                                </div>

                                <div className={formStyles.formGroup}>
                                    <Label className={formStyles.label}>Date de péremption</Label>
                                    <div className={formStyles.inputWrapper}>
                                        <Input 
                                            type="date" 
                                            name="Date_peremption" 
                                            value={formData.Date_peremption} 
                                            onChange={handleChange} 
                                            required 
                                            className={formStyles.input}
                                        />
                                    </div>
                                </div>

                                <div className={formStyles.formGroup}>
                                    <Label className={formStyles.label}>Description</Label>
                                    <div className={formStyles.inputWrapper}>
                                        <Input 
                                            type="text" 
                                            name="Description" 
                                            value={formData.Description} 
                                            onChange={handleChange} 
                                            required 
                                            className={formStyles.input}
                                            placeholder="Description du vaccin"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Colonne droite */}
                            <div className="space-y-3">
                                {/* Âge de prescription */}
                                <div className={formStyles.formGroup}>
                                    <Label className={formStyles.label}>Âge recommandé pour la prescription</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label htmlFor="Age_Annees" className={formStyles.subLabel}>Années</Label>
                                            <div className={formStyles.inputWrapper}>
                                                <Input 
                                                    id="Age_Annees"
                                                    type="number" 
                                                    name="Age_Annees" 
                                                    min="0"
                                                    max="18"
                                                    value={formData.Age_Annees} 
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        if (value === '' || /^\d+$/.test(value)) {
                                                            setFormData({ ...formData, Age_Annees: value });
                                                        }
                                                    }}
                                                    className={formStyles.input}
                                                />
                                                <span className={formStyles.inputIcon}>ans</span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="Age_Mois" className={formStyles.subLabel}>Mois</Label>
                                            <div className={formStyles.inputWrapper}>
                                                <Input 
                                                    id="Age_Mois"
                                                    type="number" 
                                                    name="Age_Mois" 
                                                    min="0"
                                                    max="11"
                                                    value={formData.Age_Mois} 
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        if (value === '' || /^\d+$/.test(value)) {
                                                            setFormData({ ...formData, Age_Mois: value });
                                                        }
                                                    }}
                                                    className={formStyles.input}
                                                />
                                                <span className={formStyles.inputIcon}>m</span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="Age_Jours" className={formStyles.subLabel}>Jours</Label>
                                            <div className={formStyles.inputWrapper}>
                                                <Input 
                                                    id="Age_Jours"
                                                    type="number" 
                                                    name="Age_Jours" 
                                                    min="0"
                                                    max="30"
                                                    value={formData.Age_Jours} 
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        if (value === '' || /^\d+$/.test(value)) {
                                                            setFormData({ ...formData, Age_Jours: value });
                                                        }
                                                    }}
                                                    className={formStyles.input}
                                                />
                                                <span className={formStyles.inputIcon}>j</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Âge minimum recommandé pour l'administration du vaccin</p>
                                </div>
                                


                                <div className={formStyles.formGroup}>
                                    <Label className={formStyles.label}>Vaccins prérequis</Label>
                                    <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50/30 shadow-inner">
                                        {availableVaccines.length > 0 ? (
                                            availableVaccines.map((vaccine) => {
                                                const isSelected = selectedPrerequisites.some(prereq => prereq.id === vaccine.id);
                                                const selectedPrereq = selectedPrerequisites.find(prereq => prereq.id === vaccine.id);
                                                const isStrict = selectedPrereq ? selectedPrereq.strict : false;
                                                
                                                return (
                                                    <div key={vaccine.id} className="flex items-center mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox 
                                                                id={`prereq-${vaccine.id}`} 
                                                                checked={isSelected}
                                                                onCheckedChange={() => handlePrerequisiteChange(vaccine.id)}
                                                            />
                                                            <label 
                                                                htmlFor={`prereq-${vaccine.id}`}
                                                                className="text-sm font-medium leading-none cursor-pointer"
                                                            >
                                                                {vaccine.Nom}
                                                            </label>
                                                        </div>
                                                        
                                                        {/* Checkbox pour strict, visible seulement si le vaccin est sélectionné */}
                                                        {isSelected && (
                                                            <div className="ml-auto flex items-center space-x-2">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <div>
                                                                                <Checkbox
                                                                                    id={`strict-${vaccine.id}`}
                                                                                    checked={isStrict}
                                                                                    onCheckedChange={(checked) => handleStrictChange(vaccine.id, !!checked)}
                                                                                />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Prérequis strict</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                                <label htmlFor={`strict-${vaccine.id}`} className="text-xs text-gray-500">
                                                                    Strict
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-gray-500">Aucun vaccin disponible</p>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Sélectionnez les vaccins prérequis nécessaires avant de prescrire ce vaccin</p>
                                </div>
                                
                                {/* Section pour les vaccins suites */}
                                <div className={formStyles.formGroup}>
                                    <Label className={formStyles.label}>Vaccins à suivre</Label>
                                    <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50/30 shadow-inner">
                                        {availableVaccines.length > 0 ? (
                                            availableVaccines.map((vaccine) => {
                                                const isSelected = selectedSuites.some(suite => suite.id === vaccine.id);
                                                const selectedSuite = selectedSuites.find(suite => suite.id === vaccine.id);
                                                const isStrict = selectedSuite ? selectedSuite.strict : false;
                                                const delai = selectedSuite ? selectedSuite.delai : 0;
                                                
                                                return (
                                                    <div key={`suite-${vaccine.id}`} className="flex items-center mb-3 flex-wrap">
                                                        <div className="flex items-center space-x-2 w-full">
                                                            <Checkbox 
                                                                id={`suite-${vaccine.id}`} 
                                                                checked={isSelected}
                                                                onCheckedChange={() => handleSuiteChange(vaccine.id)}
                                                            />
                                                            <label 
                                                                htmlFor={`suite-${vaccine.id}`}
                                                                className="text-sm font-medium leading-none cursor-pointer"
                                                            >
                                                                {vaccine.Nom}
                                                            </label>
                                                        </div>
                                                        
                                                        {/* Options additionnelles si le vaccin suite est sélectionné */}
                                                        {isSelected && (
                                                            <div className="ml-6 mt-2 flex items-center gap-4 flex-wrap">
                                                                {/* Option Strict */}
                                                                <div className="flex items-center space-x-2">
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div>
                                                                                    <Checkbox
                                                                                        id={`strict-suite-${vaccine.id}`}
                                                                                        checked={isStrict}
                                                                                        onCheckedChange={(checked) => handleSuiteStrictChange(vaccine.id, !!checked)}
                                                                                    />
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Suite stricte</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                    <label htmlFor={`strict-suite-${vaccine.id}`} className="text-xs text-gray-500">
                                                                        Strict
                                                                    </label>
                                                                </div>
                                                                
                                                                {/* Option Délai */}
                                                                <div className="flex items-center space-x-2">
                                                                    <label htmlFor={`delai-${vaccine.id}`} className="text-xs text-gray-500">
                                                                        Délai (jours):
                                                                    </label>
                                                                    <Input
                                                                        id={`delai-${vaccine.id}`}
                                                                        type="number"
                                                                        min="0"
                                                                        className="w-20 h-8 text-xs"
                                                                        value={delai}
                                                                        onChange={(e) => handleSuiteDelaiChange(vaccine.id, e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-gray-500">Aucun vaccin disponible</p>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Sélectionnez les vaccins qui doivent suivre ce vaccin, avec option de stricte nécessité et délai en jours</p>
                                </div>

                                {/* Section pour les rappels */}
                                <div className={formStyles.formGroup}>
                                    <Label className={formStyles.label}>Rappels du vaccin</Label>
                                    <div className="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto bg-gray-50/30 shadow-inner">
                                        {rappels.length > 0 ? (
                                            rappels.map((rappel, index) => (
                                                <div key={`rappel-${index}`} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-medium text-sm">Rappel #{index + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveRappel(index)}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <Label htmlFor={`rappel-delai-${index}`} className={formStyles.subLabel}>Délai (jours)</Label>
                                                            <div className={formStyles.inputWrapper}>
                                                                <Input
                                                                    id={`rappel-delai-${index}`}
                                                                    type="number"
                                                                    min="1"
                                                                    value={rappel.delai}
                                                                    onChange={(e) => handleRappelChange(index, 'delai', parseInt(e.target.value) || 0)}
                                                                    className={formStyles.input + " h-8 text-sm"}
                                                                />
                                                                <span className={formStyles.inputIcon}>j</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`rappel-desc-${index}`} className={formStyles.subLabel}>Description</Label>
                                                            <div className={formStyles.inputWrapper}>
                                                                <Input
                                                                    id={`rappel-desc-${index}`}
                                                                    type="text"
                                                                    value={rappel.description}
                                                                    onChange={(e) => handleRappelChange(index, 'description', e.target.value)}
                                                                    className={formStyles.input + " h-8 text-sm"}
                                                                    placeholder="Description du rappel"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 py-2">Aucun rappel ajouté</p>
                                        )}
                                        <Button 
                                            type="button" 
                                            onClick={handleAddRappel} 
                                            className={formStyles.secondaryButton + " w-full mt-2"}
                                        >
                                            + Ajouter un rappel
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Ajoutez des rappels pour ce vaccin avec leur délai en jours et une description</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <Button type="submit" className={formStyles.successButton}>
                                Enregistrer
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            
            <div className="w-full border-t border-gray-200 my-6"></div>
        </div>
    );
}
