import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PencilIcon } from "@heroicons/react/24/solid";

interface Vaccine {
  id: number;
  Nom: string;
  Duree: number;
  Date_arrivee: string;
  Date_peremption: string;
  Description: string;
  Age_Annees?: number;
  Age_Mois?: number;
  Age_Jours?: number;
}

interface PrerequisVaccin {
  id: number;
  strict: boolean;
}

interface SuiteVaccin {
  id: number;
  strict: boolean;
  delai: number; // délai en jours
  type?: 'strict' | 'recommande' | 'rappel'; // Type de suite: strict, recommandé ou rappel
  description?: string; // Pour les rappels
}

interface Rappel {
  delai: number; // délai en jours après l'administration du vaccin
  description: string;
}

interface EditVaccineProps {
  vaccine: Vaccine;
  onEditSuccess?: () => void;
}

export default function EditVaccine({ vaccine, onEditSuccess }: EditVaccineProps) {
  const [formData, setFormData] = useState({
    Nom: vaccine.Nom || '',
    Duree: vaccine.Duree?.toString() || '',
    Date_arrivee: vaccine.Date_arrivee || '',
    Date_peremption: vaccine.Date_peremption || '',
    Description: vaccine.Description || '',
    PrerequisVaccins: [] as PrerequisVaccin[],
    SuiteVaccins: [] as SuiteVaccin[],
    Age_Annees: (vaccine.Age_Annees || 0).toString(),
    Age_Mois: (vaccine.Age_Mois || 0).toString(),
    Age_Jours: (vaccine.Age_Jours || 0).toString(),
    Rappels: [] as Rappel[]
  });

  const [availableVaccines, setAvailableVaccines] = useState<Vaccine[]>([]);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState<PrerequisVaccin[]>([]);
  const [selectedSuites, setSelectedSuites] = useState<SuiteVaccin[]>([]);
  const [rappels, setRappels] = useState<Rappel[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour formater les dates au format nécessaire pour l'input date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Effet pour initialiser les valeurs des dates formatées
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      Date_arrivee: formatDate(vaccine.Date_arrivee),
      Date_peremption: formatDate(vaccine.Date_peremption)
    }));
  }, [vaccine]);

  // Charger tous les vaccins disponibles
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/vaccins');
        if (response.ok) {
          const vaccines = await response.json() as Vaccine[];
          setAvailableVaccines(vaccines.filter(v => v.id !== vaccine.id)); // Exclure le vaccin en cours
        } else {
          console.error('Erreur lors de la récupération des vaccins');
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
      }
    };
    
    if (open) {
      fetchVaccines();
    }
  }, [open, vaccine.id]);

  // Charger les prérequis existants du vaccin
  useEffect(() => {
    const fetchPrerequisites = async () => {
      if (!vaccine.id || !open) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/vaccins/${vaccine.id}/prerequis`);
        if (response.ok) {
          const prerequisites = await response.json();
          // Transformer les données pour correspondre à notre format de state
          const formattedPrereqs = prerequisites.map((prereq: any) => ({
            id: prereq.id,
            strict: prereq.strict || false
          }));
          
          setSelectedPrerequisites(formattedPrereqs);
          setFormData(prev => ({...prev, PrerequisVaccins: formattedPrereqs}));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des prérequis:', error);
      }
    };
    
    if (open) {
      fetchPrerequisites();
    }
  }, [vaccine.id, open]);

  // Charger les suites existantes du vaccin
  useEffect(() => {
    const fetchSuites = async () => {
      if (!vaccine.id || !open) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/vaccins/${vaccine.id}/suites`);
        if (response.ok) {
          const suites = await response.json();
          // Transformer les données pour correspondre à notre format de state
          const formattedSuites = suites.map((suite: any) => ({
            id: suite.id,
            strict: suite.strict || false,
            delai: suite.delai || 0,
            type: suite.type || (suite.strict ? 'strict' : 'recommande')
          }));
          
          setSelectedSuites(formattedSuites);
          setFormData(prev => ({...prev, SuiteVaccins: formattedSuites}));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des suites:', error);
      }
    };
    
    if (open) {
      fetchSuites();
    }
  }, [vaccine.id, open]);

  // Charger les rappels existants du vaccin
  useEffect(() => {
    const fetchRappels = async () => {
      if (!vaccine.id || !open) return;
      
      try {
        const response = await fetch(`http://localhost:3000/api/vaccins/${vaccine.id}/rappels`);
        if (response.ok) {
          const rappelsData = await response.json();
          // Transformer les données pour correspondre à notre format de state
          const formattedRappels = rappelsData.map((rappel: any) => ({
            delai: rappel.delai || 0,
            description: rappel.description || ''
          }));
          
          setRappels(formattedRappels);
          setFormData(prev => ({...prev, Rappels: formattedRappels}));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des rappels:', error);
      }
    };
    
    if (open) {
      fetchRappels();
    }
  }, [vaccine.id, open]);

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
    setIsLoading(true);
    
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
    
    // Convertir les champs numériques en nombres avant l'envoi
    const dataToSend = {
      ...formData,
      Duree: formData.Duree ? parseInt(formData.Duree, 10) : null,
      Age_Annees: parseInt(formData.Age_Annees, 10) || 0,
      Age_Mois: parseInt(formData.Age_Mois, 10) || 0,
      Age_Jours: parseInt(formData.Age_Jours, 10) || 0,
      // Envoyer les objets SuiteVaccins complets
      SuiteVaccins: allSuites,
      // Envoyer aussi les rappels séparément pour compatibilité
      Rappels: rappels
    };
    
    try {
      const response = await fetch(`http://localhost:3000/api/vaccins/${vaccine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        console.log('Vaccin modifié avec succès');
        setOpen(false);
        if (onEditSuccess) {
          onEditSuccess();
        } else {
          window.location.reload();
        }
      } else {
        const error = await response.json();
        console.error('Erreur lors de la modification du vaccin:', error);
        alert('Erreur lors de la modification du vaccin');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Erreur réseau lors de la modification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">
          <PencilIcon className="h-5 w-5" />
          Modifier le vaccin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Modifier le vaccin</DialogTitle>
          <DialogDescription>
            Modifiez les informations du vaccin et ses rappels associés.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-3">
              <div>
                <Label className="block mb-2">Nom</Label>
                <Input type="text" name="Nom" value={formData.Nom} onChange={handleChange} required />
              </div>

              <div>
                <Label className="block mb-2">Durée de l'antigène (en jours)</Label>
                <Input 
                  type="number" 
                  name="Duree" 
                  value={formData.Duree} 
                  onChange={handleDureeChange} 
                  min="1"
                  required 
                  placeholder="Entrez le nombre de jours" 
                />
              </div>

              <div>
                <Label className="block mb-2">Date d'arrivée</Label>
                <Input type="date" name="Date_arrivee" value={formData.Date_arrivee} onChange={handleChange} required />
              </div>

              <div>
                <Label className="block mb-2">Date de péremption</Label>
                <Input type="date" name="Date_peremption" value={formData.Date_peremption} onChange={handleChange} required />
              </div>

              <div>
                <Label className="block mb-2">Description</Label>
                <Input type="text" name="Description" value={formData.Description} onChange={handleChange} required />
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-3">
              {/* Âge de prescription */}
              <div className="pt-2">
                <Label className="block mb-2">Âge recommandé pour la prescription</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="Age_Annees" className="text-sm">Années</Label>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="Age_Mois" className="text-sm">Mois</Label>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="Age_Jours" className="text-sm">Jours</Label>
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
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Âge minimum recommandé pour l'administration du vaccin</p>
              </div>
              
              <div className="pt-2">
                <Label className="block mb-2">Vaccins prérequis</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                  {availableVaccines.length > 0 ? (
                    availableVaccines.map((vaccin) => {
                      const isSelected = selectedPrerequisites.some(prereq => prereq.id === vaccin.id);
                      const selectedPrereq = selectedPrerequisites.find(prereq => prereq.id === vaccin.id);
                      const isStrict = selectedPrereq ? selectedPrereq.strict : false;
                      
                      return (
                        <div key={vaccin.id} className="flex items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`prereq-${vaccin.id}`} 
                              checked={isSelected}
                              onCheckedChange={() => handlePrerequisiteChange(vaccin.id)}
                            />
                            <label 
                              htmlFor={`prereq-${vaccin.id}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {vaccin.Nom}
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
                                        id={`strict-${vaccin.id}`}
                                        checked={isStrict}
                                        onCheckedChange={(checked) => handleStrictChange(vaccin.id, !!checked)}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Prérequis strict</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <label htmlFor={`strict-${vaccin.id}`} className="text-xs text-gray-500">
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
              <div className="pt-2">
                <Label className="block mb-2">Vaccins à suivre (suites)</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                  {availableVaccines.length > 0 ? (
                    availableVaccines.map((vaccin) => {
                      const isSelected = selectedSuites.some(suite => suite.id === vaccin.id);
                      const selectedSuite = selectedSuites.find(suite => suite.id === vaccin.id);
                      const isStrict = selectedSuite ? selectedSuite.strict : false;
                      const delai = selectedSuite ? selectedSuite.delai : 0;
                      
                      return (
                        <div key={`suite-${vaccin.id}`} className="flex items-center mb-3 flex-wrap">
                          <div className="flex items-center space-x-2 w-full">
                            <Checkbox 
                              id={`suite-${vaccin.id}`} 
                              checked={isSelected}
                              onCheckedChange={() => handleSuiteChange(vaccin.id)}
                            />
                            <label 
                              htmlFor={`suite-${vaccin.id}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {vaccin.Nom}
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
                                          id={`strict-suite-${vaccin.id}`}
                                          checked={isStrict}
                                          onCheckedChange={(checked) => handleSuiteStrictChange(vaccin.id, !!checked)}
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Suite stricte</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <label htmlFor={`strict-suite-${vaccin.id}`} className="text-xs text-gray-500">
                                  Strict
                                </label>
                              </div>
                              
                              {/* Option Délai */}
                              <div className="flex items-center space-x-2">
                                <label htmlFor={`delai-${vaccin.id}`} className="text-xs text-gray-500">
                                  Délai (jours):
                                </label>
                                <Input
                                  id={`delai-${vaccin.id}`}
                                  type="number"
                                  min="0"
                                  className="w-20 h-8 text-xs"
                                  value={delai}
                                  onChange={(e) => handleSuiteDelaiChange(vaccin.id, e.target.value)}
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
              <div className="pt-2">
                <Label className="block mb-2">Rappels du vaccin</Label>
                <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
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
                            <Label htmlFor={`rappel-delai-${index}`} className="text-xs mb-1 block">Délai (jours)</Label>
                            <Input
                              id={`rappel-delai-${index}`}
                              type="number"
                              min="1"
                              value={rappel.delai}
                              onChange={(e) => handleRappelChange(index, 'delai', parseInt(e.target.value) || 0)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rappel-desc-${index}`} className="text-xs mb-1 block">Description</Label>
                            <Input
                              id={`rappel-desc-${index}`}
                              type="text"
                              value={rappel.description}
                              onChange={(e) => handleRappelChange(index, 'description', e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Description du rappel"
                            />
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
                    className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1"
                  >
                    + Ajouter un rappel
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Ajoutez des rappels pour ce vaccin avec leur délai en jours et une description</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
