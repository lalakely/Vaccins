import { useState, useEffect } from "react";
import { buildApiUrl } from "../../config/api";
import { format } from "date-fns";

// Define interfaces for our data types
interface Vaccine {
  id: string;
  vaccin_id: string; // ID du vaccin référencé
  Nom: string;
  name: string;
  date_vaccination: string;
  // Add any other properties that your vaccine objects have
}

// Ces interfaces sont utilisées pour typer les données reçues de l'API
interface OverdueVaccine {
  id: string;
  name: string;
  Age_Annees: number;
  Age_Mois: number;
  Age_Jours: number;
  Description?: string;
}

// New interface for upcoming vaccines
interface UpcomingVaccine {
  id: string;
  name: string;
  days_remaining: number;
  parent_vaccine_name: string;
  strict: boolean;
  delai: number;
  vaccin_id: string; // Ajout de l'ID du vaccin pour récupérer les rappels
  type?: string; // Type de vaccin: 'strict', 'recommande', 'rappel'
}

// Interface for vaccine reminders (rappels)
interface Rappel {
  delai: number;
  description: string;
  id?: string;
  vaccin_id?: string;
}

import {
  PlusIcon,
  TrashIcon,
  ShieldCheckIcon,
  ClockIcon,
  InboxIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon as ClockOutlineIcon,
  BellAlertIcon,
  ExclamationCircleIcon,
  ArrowPathIcon as RefreshIcon,
} from "@heroicons/react/24/solid";
// Les composants Select ne sont pas utilisés dans ce fichier

function ChildVaccinations({ enfantId }: { enfantId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [upcomingVaccineRappels, setUpcomingVaccineRappels] = useState<{[key: string]: Rappel[]}>({});  // Utilisé pour stocker les rappels des vaccins à venir
  const [selectedVaccine, setSelectedVaccine] = useState<string>("");
  const [availableVaccines, setAvailableVaccines] = useState<any[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [overdueVaccines, setOverdueVaccines] = useState<OverdueVaccine[]>([]);
  const [upcomingVaccines, setUpcomingVaccines] = useState<UpcomingVaccine[]>([]);
  // État pour stocker les vaccins à suivre filtrés (sans les vaccins déjà administrés)
  const [filteredUpcomingVaccines, setFilteredUpcomingVaccines] = useState<UpcomingVaccine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCombobox, setShowCombobox] = useState(false);
  const [activeTab, setActiveTab] = useState<"administered" | "overdue" | "upcoming">("administered");
  const [prerequisiteWarning, setPrerequisiteWarning] = useState<{message: string, missingPrerequisites: any[], canBeAdministered: boolean} | undefined>(undefined);
  // État pour stocker les rappels de chaque vaccin
  const [vaccineRappels, setVaccineRappels] = useState<{[key: string]: Rappel[]}>({});
  // État pour stocker les rappels administrés
  const [administeredRappels, setAdministeredRappels] = useState<{[key: string]: boolean[]}>({});
  // État pour suivre les vaccins dont tous les rappels ont été administrés
  const [fullyAdministeredVaccines, setFullyAdministeredVaccines] = useState<Record<string, boolean>>({});

  // Fonction pour regrouper les vaccins par leur vaccin_id
  const groupVaccinesByType = (vaccines: Vaccine[]) => {
    const groupedVaccines: { [key: string]: { vaccine: Vaccine; count: number } } = {};
    
    vaccines.forEach(vaccine => {
      if (!groupedVaccines[vaccine.vaccin_id]) {
        groupedVaccines[vaccine.vaccin_id] = {
          vaccine: vaccine,
          count: 1
        };
      } else {
        groupedVaccines[vaccine.vaccin_id].count += 1;
      }
    });
    
    return Object.values(groupedVaccines);
  };

  // Vérifie si un rappel a déjà été administré pour un vaccin donné
  const hasAnyRappelBeenAdministered = (vaccinId: string): boolean => {
    // Trouver le vaccin dans la liste des vaccins administrés
    const administeredVaccine = vaccines.find(v => v.vaccin_id === vaccinId);
    
    if (administeredVaccine && administeredRappels[administeredVaccine.id]) {
      // Vérifier si au moins un rappel a été administré pour ce vaccin
      return administeredRappels[administeredVaccine.id].some(isAdministered => isAdministered === true);
    }
    
    return false;
  };

  // Filtrer les vaccins à suivre pour ne pas afficher ceux qui ont déjà été administrés
  useEffect(() => {
    // Filtrer les vaccins à suivre pour ne pas afficher ceux qui ont déjà été administrés
    const filteredVaccines: UpcomingVaccine[] = upcomingVaccines.filter((vaccine: UpcomingVaccine) => {
      // Vérifier si ce vaccin a déjà été administré
      const isVaccineAdministered = vaccines.some(v => v.vaccin_id === vaccine.vaccin_id);
      
      // Si ce vaccin a déjà été administré, ne pas l'afficher dans les vaccins à suivre
      if (isVaccineAdministered) {
        return false;
      }
      
      // Si c'est un rappel, vérifier s'il a déjà été administré
      if (vaccine.type === 'rappel' && vaccine.parent_vaccine_name) {
        // Trouver le vaccin parent
        const parentVaccine = vaccines.find(v => v.name === vaccine.parent_vaccine_name);
        
        if (parentVaccine) {
          // Vérifier si un rappel a déjà été administré pour ce vaccin
          // Si oui, ne pas afficher d'autres rappels pour ce vaccin
          if (hasAnyRappelBeenAdministered(parentVaccine.vaccin_id)) {
            return false;
          }
          
          // Vérifier si ce rappel spécifique a déjà été administré
          const rappelIndex = vaccineRappels[parentVaccine.id]?.findIndex(
            r => r.vaccin_id === vaccine.vaccin_id || r.delai === vaccine.delai
          );
          
          if (rappelIndex !== -1 && rappelIndex !== undefined) {
            // Vérifier si ce rappel a été administré
            if (administeredRappels[parentVaccine.id]?.[rappelIndex]) {
              return false; // Ce rappel a déjà été administré, ne pas l'afficher
            }
            
            // Si ce rappel n'a pas été administré, l'afficher
            return true;
          }
        }
      }
      
      // Si ce n'est pas un rappel et qu'il n'a pas été administré, l'afficher
      return true;
    });
    
    setFilteredUpcomingVaccines(filteredVaccines);
  }, [upcomingVaccines, vaccines, vaccineRappels, administeredRappels]);

  useEffect(() => {
    const fetchVaccines = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(buildApiUrl("/api/vaccins"), {
          cache: "no-store",
        });
        const data = await response.json();
        setAvailableVaccines(data);
      } catch (error) {
        setError("Erreur lors du chargement des vaccins");
        console.error("Error fetching vaccines:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchChildVaccinations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          buildApiUrl(`/api/vaccinations/child?enfant_id=${enfantId}`),
          {
            cache: "no-store",
          }
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la requête au serveur");
        }
        const data = await response.json();
        setVaccines(data); // Les données incluent maintenant le champ "name"
        
        // Pour chaque vaccin, récupérer ses rappels
        const rappelsPromises = data.map(async (vaccine: Vaccine) => {
          try {
            const rappelsResponse = await fetch(buildApiUrl(`/api/vaccins/${vaccine.vaccin_id}/rappels`));
            if (rappelsResponse.ok) {
              const rappelsData = await rappelsResponse.json();
              return { vaccineId: vaccine.id, rappels: rappelsData };
            }
            return { vaccineId: vaccine.id, rappels: [] };
          } catch (err) {
            console.error(`Erreur lors du chargement des rappels pour le vaccin ${vaccine.id}:`, err);
            return { vaccineId: vaccine.id, rappels: [] };
          }
        });
        
        // Attendre que toutes les requêtes de rappels soient terminées
        const rappelsResults = await Promise.all(rappelsPromises);
        
        // Construire un objet avec les rappels indexés par l'ID du vaccin
        const rappelsMap = rappelsResults.reduce((acc, { vaccineId, rappels }) => {
          acc[vaccineId] = rappels;
          return acc;
        }, {});
        
        setVaccineRappels(rappelsMap);
        
        // Vérifier les rappels administrés
        const checkAdministeredRappels = async () => {
          const administeredMap: {[key: string]: boolean[]} = {};
          
          for (const vaccine of data) {
            if (rappelsMap[vaccine.id] && rappelsMap[vaccine.id].length > 0) {
              // Initialiser le tableau de statut des rappels pour ce vaccin
              administeredMap[vaccine.id] = new Array(rappelsMap[vaccine.id].length).fill(false);
              
              // Pour chaque rappel, vérifier s'il a été administré
              for (let i = 0; i < rappelsMap[vaccine.id].length; i++) {
                const rappel = rappelsMap[vaccine.id][i];
                const rappelDate = new Date(vaccine.date_vaccination);
                rappelDate.setDate(rappelDate.getDate() + rappel.delai);
                
                // Vérifier si ce rappel a été administré (si un vaccin avec le même nom existe et a été administré après la date du rappel)
                try {
                  const rappelCheckResponse = await fetch(
                    buildApiUrl(`/api/vaccinations/check-rappel?enfant_id=${enfantId}&vaccin_id=${vaccine.vaccin_id}&date_rappel=${rappelDate.toISOString().split('T')[0]}`)
                  );
                  
                  if (rappelCheckResponse.ok) {
                    const checkResult = await rappelCheckResponse.json();
                    administeredMap[vaccine.id][i] = checkResult.administered;
                  }
                } catch (err) {
                  console.error(`Erreur lors de la vérification du rappel pour le vaccin ${vaccine.id}:`, err);
                }
              }
            }
          }
          
          setAdministeredRappels(administeredMap);
        };
        
        checkAdministeredRappels();
      } catch (error) {
        setError("Erreur lors du chargement des vaccinations");
        console.error("Error fetching child vaccinations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchOverdueVaccines = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          buildApiUrl(`/api/vaccinations/overdue?enfant_id=${enfantId}`),
          {
            cache: "no-store",
          }
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la requête au serveur");
        }
        const data = await response.json();
        setOverdueVaccines(data);
      } catch (error) {
        console.error("Error fetching overdue vaccines:", error);
        // Ne pas afficher d'erreur spécifique pour les vaccins en retard
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUpcomingVaccines = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          buildApiUrl(`/api/vaccinations/upcoming?enfant_id=${enfantId}`), {
          cache: "no-store" 
        });
        if (!response.ok) {
          throw new Error("Erreur lors de la requête au serveur");
        }
        const data = await response.json();
        setUpcomingVaccines(data);
        
        // Pour chaque vaccin à suivre, récupérer ses rappels
        const rappelsPromises = data.map(async (vaccine: UpcomingVaccine) => {
          try {
            const rappelsResponse = await fetch(buildApiUrl(`/api/vaccins/${vaccine.vaccin_id}/rappels`));
            if (rappelsResponse.ok) {
              const rappelsData = await rappelsResponse.json();
              return { vaccineId: vaccine.id, rappels: rappelsData };
            }
            return { vaccineId: vaccine.id, rappels: [] };
          } catch (err) {
            console.error(`Erreur lors du chargement des rappels pour le vaccin ${vaccine.id}:`, err);
            return { vaccineId: vaccine.id, rappels: [] };
          }
        });
        
        // Attendre que toutes les requêtes de rappels soient terminées
        const rappelsResults = await Promise.all(rappelsPromises);
        
        // Construire un objet avec les rappels indexés par l'ID du vaccin
        const rappelsMap = rappelsResults.reduce((acc, { vaccineId, rappels }) => {
          acc[vaccineId] = rappels;
          return acc;
        }, {});
        
        setUpcomingVaccineRappels(rappelsMap);
      } catch (error) {
        setError("Erreur lors du chargement des vaccins à suivre");
        console.error("Error fetching upcoming vaccines:", error);
      } finally {
        setIsLoading(false);
      }  
    };

    // Toujours charger la liste des vaccins disponibles, indépendamment de l'enfant sélectionné
    fetchVaccines();

    if (enfantId) {
      fetchChildVaccinations();
      fetchOverdueVaccines();
      fetchUpcomingVaccines();
    }
  }, [enfantId]);

  // Vérifier si un vaccin peut être administré (prérequis satisfaits)
  const checkVaccinePrerequisites = async (vaccinId: string) => {
    if (!vaccinId || !enfantId) return;
    
    try {
      const response = await fetch(
        buildApiUrl(`/api/vaccinations/check-prerequisites?vaccin_id=${vaccinId}&enfant_id=${enfantId}`), {
          cache: "no-store" 
        });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la vérification des prérequis");
      }
      
      const data = await response.json();
      setPrerequisiteWarning(data);
      return data;
    } catch (error) {
      console.error("Error checking vaccine prerequisites:", error);
      setError("Erreur lors de la vérification des prérequis du vaccin");
      return null;
    }
  };
  
  // Quand l'utilisateur sélectionne un vaccin dans la liste déroulante
  // Vérifier si tous les rappels d'un vaccin ont été administrés
  const checkAllRappelsAdministered = async (vaccinId: string) => {
    try {
      const response = await fetch(
        buildApiUrl(`/api/vaccinations/check-all-rappels-administered?enfant_id=${enfantId}&vaccin_id=${vaccinId}`), {
          cache: "no-store" 
        });
      
      if (!response.ok) {
        console.error("Erreur lors de la vérification des rappels administrés:", response.status);
        return { allAdministered: false };
      }
      
      const data = await response.json();
      console.log("checkAllRappelsAdministered résultat:", data);
      
      // Mettre à jour l'état des vaccins complètement administrés
      setFullyAdministeredVaccines(prev => ({
        ...prev,
        [vaccinId]: data.allAdministered
      }));
      
      return data;
    } catch (error) {
      console.error("Erreur lors de la vérification des rappels administrés:", error);
      return { allAdministered: false };
    }
  };

  // État pour stocker les informations sur le nombre maximal d'administrations
  const [maxRappelsInfo, setMaxRappelsInfo] = useState<{[key: string]: {maxReached: boolean, currentCount: number, maxAllowed: number}}>({});

  const handleVaccineSelection = async (vaccinId: string) => {
    setSelectedVaccine(vaccinId);
    await checkVaccinePrerequisites(vaccinId);
    await checkAllRappelsAdministered(vaccinId);
    
    // Vérifier si le nombre maximal d'administrations est atteint
    const maxRappelsCheck = await checkMaxRappelsReached(vaccinId);
    setMaxRappelsInfo(prev => ({
      ...prev,
      [vaccinId]: maxRappelsCheck
    }));
  };
  
  // Vérifier si un vaccin est un rappel d'un vaccin existant
  const checkIfVaccineIsRappel = async (vaccinId: string) => {
    try {
      // Vérifier si le vaccin est un rappel d'un vaccin existant
      const response = await fetch(
        buildApiUrl(`/api/vaccinations/check-rappel-status?enfant_id=${enfantId}&vaccin_id=${vaccinId}`), {
          cache: "no-store" 
        });
      
      if (!response.ok) {
        return { isRappel: false, parentVaccineId: null };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking if vaccine is rappel:", error);
      return { isRappel: false, parentVaccineId: null };
    }
  };

  // Fonction pour administrer directement un rappel depuis la liste des vaccins administrés
  const handleAdministerRappel = async (parentVaccineId: string, rappelVaccinId: string) => {
    try {
      // Afficher un indicateur de chargement
      setIsLoading(true);
      
      // Appel API pour marquer le rappel comme administré
      const response = await fetch(buildApiUrl(`/api/vaccinations/mark-rappel-administered`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enfant_id: enfantId,
          parent_vaccin_id: parentVaccineId,
          rappel_vaccin_id: rappelVaccinId,
          date_administration: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du rappel");
      }
      
      // Mettre à jour les rappels administrés
      const updatedAdministeredRappels = { ...administeredRappels };
      
      // Trouver l'index du rappel dans le tableau des rappels pour ce vaccin
      if (vaccineRappels[parentVaccineId]) {
        const rappelIndex = vaccineRappels[parentVaccineId].findIndex(
          r => r.vaccin_id === rappelVaccinId || r.id === rappelVaccinId
        );
        
        if (rappelIndex !== -1) {
          if (!updatedAdministeredRappels[parentVaccineId]) {
            updatedAdministeredRappels[parentVaccineId] = new Array(vaccineRappels[parentVaccineId].length).fill(false);
          }
          updatedAdministeredRappels[parentVaccineId][rappelIndex] = true;
          setAdministeredRappels(updatedAdministeredRappels);
        }
      }

      // Rafraîchir les données après la mise à jour du rappel
      await refreshData();
      
      // Afficher un message de succès
      setSuccessMessage("Rappel administré avec succès");
      setTimeout(() => setSuccessMessage(null), 3000); // Effacer le message après 3 secondes
    } catch (error) {
      console.error("Error administering rappel:", error);
      setError("Erreur lors de l'administration du rappel");
      setTimeout(() => setError(null), 3000); // Effacer le message après 3 secondes
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si le nombre maximum de rappels a été atteint pour un vaccin
  const checkMaxRappelsReached = async (vaccinId: string) => {
    try {
      // Récupérer le nombre de rappels prévus pour ce vaccin
      const rappelsResponse = await fetch(buildApiUrl(`/api/vaccins/${vaccinId}/rappels`));
      if (!rappelsResponse.ok) {
        throw new Error("Erreur lors de la récupération des rappels");
      }
      const rappelsData = await rappelsResponse.json();
      const maxRappels = rappelsData.length;
      
      // Récupérer le nombre de fois que ce vaccin a été administré à l'enfant
      const administeredResponse = await fetch(
        buildApiUrl(`/api/vaccinations/count?enfant_id=${enfantId}&vaccin_id=${vaccinId}`)
      );
      if (!administeredResponse.ok) {
        throw new Error("Erreur lors de la récupération du nombre d'administrations");
      }
      const { count } = await administeredResponse.json();
      
      // Si le nombre d'administrations est supérieur au nombre de rappels + 1 (dose initiale)
      // alors le nombre maximum de rappels a été atteint
      return {
        maxReached: count >= maxRappels + 1,
        currentCount: count,
        maxAllowed: maxRappels + 1
      };
    } catch (error) {
      console.error("Error checking max rappels:", error);
      return { maxReached: false, currentCount: 0, maxAllowed: 0 };
    }
  };

  // Déclaration de la fonction refreshData pour qu'elle soit accessible partout
  const refreshData = async () => {
    try {
      // Rafraîchir les vaccins en retard
      const fetchUpdatedOverdueVaccines = async () => {
        try {
          const overdueResponse = await fetch(
            buildApiUrl(`/api/vaccinations/overdue?enfant_id=${enfantId}`), {
          cache: "no-store" 
        });
          if (overdueResponse.ok) {
            const overdueData = await overdueResponse.json();
            setOverdueVaccines(overdueData);
          }
        } catch (err) {
          console.error("Error refreshing overdue vaccines:", err);
        }
      };
      
      // Rafraîchir la liste des vaccins à suivre
      const fetchUpdatedUpcomingVaccines = async () => {
        try {
          const upcomingResponse = await fetch(
            buildApiUrl(`/api/vaccinations/upcoming?enfant_id=${enfantId}`), {
          cache: "no-store" 
        });
          if (upcomingResponse.ok) {
            const upcomingData = await upcomingResponse.json();
            setUpcomingVaccines(upcomingData);
            
            // Rafraîchir également les rappels pour les vaccins à suivre
            const updatedRappels: Record<string, Rappel[]> = {};
            
            for (const vaccine of upcomingData) {
              try {
                const rappelsResponse = await fetch(
                  buildApiUrl(`/api/vaccins/${vaccine.vaccin_id}/rappels`), {
          cache: "no-store" 
        });
                
                if (rappelsResponse.ok) {
                  const rappelsData = await rappelsResponse.json();
                  updatedRappels[vaccine.id] = rappelsData;
                }
              } catch (err) {
                console.error(`Error fetching rappels for vaccine ${vaccine.id}:`, err);
              }
            }
            
            setUpcomingVaccineRappels(updatedRappels);
          }
        } catch (err) {
          console.error("Error refreshing upcoming vaccines:", err);
        }
      };
      
      // Rafraîchir les vaccins administrés et leurs rappels
      const fetchUpdatedAdministeredVaccines = async () => {
        try {
          const response = await fetch(
            buildApiUrl(`/api/vaccinations/child?enfant_id=${enfantId}`), {
          cache: "no-store" 
        });
          if (response.ok) {
            const data = await response.json();
            setVaccines(data);
            
            // Pour chaque vaccin, récupérer ses rappels
            const rappelsPromises = data.map(async (vaccine: Vaccine) => {
              try {
                const rappelsResponse = await fetch(buildApiUrl(`/api/vaccins/${vaccine.vaccin_id}/rappels`));
                if (rappelsResponse.ok) {
                  const rappelsData = await rappelsResponse.json();
                  return { vaccineId: vaccine.id, rappels: rappelsData };
                }
                return { vaccineId: vaccine.id, rappels: [] };
              } catch (err) {
                console.error(`Erreur lors du chargement des rappels pour le vaccin ${vaccine.id}:`, err);
                return { vaccineId: vaccine.id, rappels: [] };
              }
            });
            
            // Attendre que toutes les requêtes de rappels soient terminées
            const rappelsResults = await Promise.all(rappelsPromises);
            
            // Construire un objet avec les rappels indexés par l'ID du vaccin
            const rappelsMap = rappelsResults.reduce((acc, { vaccineId, rappels }) => {
              acc[vaccineId] = rappels;
              return acc;
            }, {});
            
            setVaccineRappels(rappelsMap);
            
            // Vérifier les rappels administrés
            const administeredMap: {[key: string]: boolean[]} = {};
            
            for (const vaccine of data) {
              if (rappelsMap[vaccine.id] && rappelsMap[vaccine.id].length > 0) {
                // Initialiser le tableau de statut des rappels pour ce vaccin
                administeredMap[vaccine.id] = new Array(rappelsMap[vaccine.id].length).fill(false);
                
                // Pour chaque rappel, vérifier s'il a été administré
                for (let i = 0; i < rappelsMap[vaccine.id].length; i++) {
                  const rappel = rappelsMap[vaccine.id][i];
                  const rappelDate = new Date(vaccine.date_vaccination);
                  rappelDate.setDate(rappelDate.getDate() + rappel.delai);
                  
                  // Vérifier si ce rappel a été administré
                  try {
                    const rappelCheckResponse = await fetch(
                      buildApiUrl(`/api/vaccinations/check-rappel?enfant_id=${enfantId}&vaccin_id=${vaccine.vaccin_id}&date_rappel=${rappelDate.toISOString().split('T')[0]}`)
                    );
                    
                    if (rappelCheckResponse.ok) {
                      const checkResult = await rappelCheckResponse.json();
                      administeredMap[vaccine.id][i] = checkResult.administered;
                    }
                  } catch (err) {
                    console.error(`Erreur lors de la vérification du rappel pour le vaccin ${vaccine.id}:`, err);
                  }
                }
              }
            }
            
            setAdministeredRappels(administeredMap);
          }
        } catch (err) {
          console.error("Error refreshing administered vaccines:", err);
        }
      };
      
      // Exécuter les rafraîchissements
      await Promise.all([
        fetchUpdatedOverdueVaccines(), 
        fetchUpdatedUpcomingVaccines(),
        fetchUpdatedAdministeredVaccines()
      ]);
      
      // Réinitialiser l'interface utilisateur
      setSelectedVaccine("");
      setShowCombobox(false);
      
      // Ajouter un petit délai pour s'assurer que les données sont bien mises à jour
      setTimeout(() => {
        // Forcer la mise à jour des filtres
        setFilteredUpcomingVaccines(prev => {
          // Déclencher une nouvelle évaluation du filtre
          return [...prev];
        });
      }, 500);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleAddVaccine = async () => {
    if (!selectedVaccine || !enfantId) {
      console.error("Vaccine or enfantId missing");
      return;
    }
    
    try {
      // Vérifier les prérequis avant d'ajouter le vaccin
      const prerequisiteCheck = await checkVaccinePrerequisites(selectedVaccine);
      
      // Si le vaccin ne peut pas être administré (prérequis stricts manquants)
      if (prerequisiteCheck && !prerequisiteCheck.canBeAdministered) {
        return; // Arrêter l'ajout du vaccin
      }

      // La vérification du nombre maximum de rappels a été supprimée pour permettre l'administration multiple du même vaccin

      // La vérification d'unicité du vaccin a été supprimée pour permettre l'administration multiple du même vaccin
      const rappelCheck = await checkIfVaccineIsRappel(selectedVaccine);

      // Si c'est un rappel, mettre à jour l'état du rappel au lieu d'ajouter un nouveau vaccin
      if (rappelCheck.isRappel && rappelCheck.parentVaccineId) {
        try {
          console.log("Tentative de marquer un rappel comme administré:", {
            enfant_id: enfantId,
            parent_vaccin_id: rappelCheck.parentVaccineId,
            rappel_vaccin_id: selectedVaccine,
            date_administration: new Date().toISOString().split("T")[0],
          });
          
          const response = await fetch(buildApiUrl(`/api/vaccinations/mark-rappel-administered`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enfant_id: enfantId,
              parent_vaccin_id: rappelCheck.parentVaccineId,
              rappel_vaccin_id: selectedVaccine,
              date_administration: new Date().toISOString().split("T")[0],
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Erreur inconnue" }));
            console.error("Erreur lors de la mise à jour du rappel:", response.status, errorData);
            throw new Error(`Erreur lors de la mise à jour du rappel: ${errorData.message || response.statusText}`);
          }
          
          // Réinitialiser l'avertissement des prérequis
          setPrerequisiteWarning(undefined);

          // Mettre à jour les rappels administrés
          const updatedAdministeredRappels = { ...administeredRappels };
          
          // Trouver l'index du rappel dans le tableau des rappels pour ce vaccin
          const parentVaccine = vaccines.find(v => v.id === rappelCheck.parentVaccineId);
          if (parentVaccine && vaccineRappels[parentVaccine.id]) {
            const rappelIndex = vaccineRappels[parentVaccine.id].findIndex(
              r => r.vaccin_id === selectedVaccine || r.id === selectedVaccine
            );
            
            if (rappelIndex !== -1) {
              if (!updatedAdministeredRappels[parentVaccine.id]) {
                updatedAdministeredRappels[parentVaccine.id] = new Array(vaccineRappels[parentVaccine.id].length).fill(false);
              }
              updatedAdministeredRappels[parentVaccine.id][rappelIndex] = true;
              setAdministeredRappels(updatedAdministeredRappels);
            }
          }

          // Rafraîchir les données après la mise à jour du rappel
          await refreshData();
          
          // Vérifier si tous les rappels ont été administrés pour ce vaccin
          if (rappelCheck.parentVaccineId) {
            await checkAllRappelsAdministered(rappelCheck.parentVaccineId);
          }
        } catch (error) {
          console.error("Error marking rappel as administered:", error);
          setError("Erreur lors de la mise à jour du rappel");
          return;
        }
      } else {
        // Sinon, ajouter un nouveau vaccin normalement après vérification du nombre maximal d'administrations
        try {
          // Vérifier si le nombre maximum d'administrations a été atteint
          const maxRappelsCheck = await checkMaxRappelsReached(selectedVaccine);
          
          if (maxRappelsCheck.maxReached) {
            // Afficher un message d'erreur si le nombre maximum d'administrations a été atteint
            setError(`Ce vaccin a déjà été administré ${maxRappelsCheck.currentCount} fois sur ${maxRappelsCheck.maxAllowed} autorisées (dose initiale + rappels).`);
            setTimeout(() => setError(null), 5000); // Effacer le message après 5 secondes
            return;
          }
          
          const response = await fetch(buildApiUrl("/api/vaccinations"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enfant_id: enfantId,
              vaccin_id: selectedVaccine,
              date_vaccination: new Date().toISOString().split("T")[0],
            }),
          });

          if (!response.ok) {
            throw new Error("Erreur lors de l'ajout du vaccin");
          }
          
          // Réinitialiser l'avertissement des prérequis
          setPrerequisiteWarning(undefined);

          const newVaccination = await response.json(); // Contient maintenant toutes les données, y compris "name"
          
          // Mettre à jour la liste des vaccins administrés
          setVaccines((prevVaccines) => [...prevVaccines, newVaccination]);
          
          // Rafraîchir les données après l'ajout du vaccin
          await refreshData();
          
          // Vérifier si tous les rappels ont été administrés pour ce vaccin
          await checkAllRappelsAdministered(selectedVaccine);
        } catch (error) {
          console.error("Error adding new vaccination:", error);
          setError("Erreur lors de l'ajout du vaccin");
          return;
        }
      }
    } catch (error) {
      console.error("Error adding vaccination:", error);
      setError("Erreur lors de l'ajout du vaccin");
    }
  };

  const handleDeleteVaccine = async (vaccineId: string) => {
    try {
      const response = await fetch(
        buildApiUrl(`/api/vaccinations/${vaccineId}`),
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setVaccines((prevVaccines) =>
        prevVaccines.filter((vaccine) => vaccine.id !== vaccineId)
      );
    } catch (error) {
      console.error("Error deleting vaccination:", error);
      setError("Erreur lors de la suppression de la vaccination");
    }
  };

  // La fonction handleCancel a été supprimée car nous utilisons setShowCombobox(false) directement dans le bouton "Annuler"

  if (!enfantId) {
    return <div className="text-red-600">Erreur : ID de l'enfant non spécifié</div>;
  }

  if (isLoading) {
    return <div className="text-gray-600 animate-pulse">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600 font-semibold">{error}</div>;
  }

  return (
    <div
      className="bg-gray-50 p-6 rounded-lg shadow-lg max-w-3xl w-full"
      style={{ minWidth: "400px" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldCheckIcon className="h-6 w-6 text-gray-600" /> Vaccinations
        </h2>
        {!showCombobox && (
          <button
            onClick={() => setShowCombobox(true)}
            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-md"
          >
            <PlusIcon className="h-5 w-5" /> Ajouter
          </button>
        )}
      </div>
      
      {/* Message de succès */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md border border-green-300 flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Barre de navigation pour basculer entre les onglets */}
      <div className="flex mb-4 bg-gray-100 space-x-3 p-2 rounded-lg">
        <button
          onClick={() => setActiveTab("administered")}
          className={`relative py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${
            activeTab === "administered"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Vaccins administrés
          {vaccines.length > 0 && (
            <span className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
              {vaccines.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("overdue")}
          className={`relative py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${
            activeTab === "overdue"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Vaccins en retard
          {overdueVaccines.length > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
              {overdueVaccines.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`relative py-3 px-6 font-medium text-sm focus:outline-none transition-colors ${
            activeTab === "upcoming"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Vaccins à suivre
          {filteredUpcomingVaccines.length > 0 && (
            <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
              {filteredUpcomingVaccines.length}
            </span>
          )}
        </button>
      </div>

      {/* Affichage conditionnel selon l'onglet actif */}
      <div className="mt-4">
        {/* Onglet Vaccins administrés */}
        {activeTab === "administered" && (
          <div>
            {vaccines.length === 0 ? (
              <div className="text-center py-6">
                <InboxIcon className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 text-lg">
                  Aucun vaccin prescrit pour cet enfant
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groupVaccinesByType(vaccines).map((groupedVaccine) => (
                    <div
                      key={`administered-${groupedVaccine.vaccine.id}`}
                      className="relative bg-white p-4 rounded-lg shadow-md group hover:bg-gray-100 transition-colors"
                    >
                      {/* Badge indiquant le nombre d'administrations */}
                      {groupedVaccine.count > 1 && (
                        <div className="absolute top-2 right-8 bg-blue-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {groupedVaccine.count}x
                        </div>
                      )}
                      
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-600" />{" "}
                        {groupedVaccine.vaccine.name || groupedVaccine.vaccine.Nom || "Vaccin sans nom"}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-500" />
                        Dernière date: {new Date(groupedVaccine.vaccine.date_vaccination).toLocaleDateString()}
                      </p>
                      
                      {/* Affichage des rappels avec cases à cocher */}
                      {vaccineRappels[groupedVaccine.vaccine.id] && vaccineRappels[groupedVaccine.vaccine.id].length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <BellAlertIcon className="h-4 w-4 text-indigo-600" />
                            <p className="text-sm font-semibold text-indigo-700">
                              Rappels programmés ({vaccineRappels[groupedVaccine.vaccine.id].length})
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {vaccineRappels[groupedVaccine.vaccine.id].map((rappel, index) => {
                              const rappelDate = new Date(groupedVaccine.vaccine.date_vaccination);
                              rappelDate.setDate(rappelDate.getDate() + rappel.delai);
                              const isRappelDue = new Date() >= rappelDate;
                              const isToday = new Date().toDateString() === rappelDate.toDateString();
                              
                              // Vérifier si le rappel a été administré
                              const isRappelAdministered = administeredRappels[groupedVaccine.vaccine.id] && administeredRappels[groupedVaccine.vaccine.id][index];
                              
                              // Définir les couleurs et styles en fonction de l'état du rappel
                              let bgColor = isRappelAdministered ? 'bg-green-50' : isRappelDue ? 'bg-yellow-50' : isToday ? 'bg-yellow-50' : 'bg-blue-50';
                              let borderColor = isRappelAdministered ? 'border-green-200' : isRappelDue ? 'border-yellow-200' : isToday ? 'border-yellow-200' : 'border-blue-200';
                              let textColor = isRappelAdministered ? 'text-green-800' : isRappelDue ? 'text-yellow-800' : isToday ? 'text-yellow-800' : 'text-blue-800';
                              let iconColor = isRappelAdministered ? 'text-green-600' : isRappelDue ? 'text-yellow-600' : isToday ? 'text-yellow-600' : 'text-blue-600';
                              
                              return (
                                <div 
                                  key={`${groupedVaccine.vaccine.id}-rappel-${index}`} 
                                  className={`flex items-center gap-2 ${bgColor} px-3 py-2 rounded-md border ${borderColor} shadow-sm transition-all hover:shadow-md`}
                                >
                                  {isRappelAdministered ? (
                                    <div className="flex items-center gap-1">
                                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">Administré</span>
                                    </div>
                                  ) : isRappelDue ? (
                                    <ExclamationCircleIcon className={`h-5 w-5 ${iconColor}`} />
                                  ) : isToday ? (
                                    <ExclamationCircleIcon className={`h-5 w-5 ${iconColor}`} />
                                  ) : (
                                    <ClockOutlineIcon className={`h-5 w-5 ${iconColor}`} />
                                  )}
                                  
                                  <div className="flex flex-col">
                                    <span className={`text-xs font-medium ${textColor}`}>
                                      {rappel.delai === 0 ? 'Immédiat' : `J+${rappel.delai}`}
                                    </span>
                                    {rappel.description && (
                                      <span className="text-xs text-gray-600">
                                        {rappel.description}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Bouton pour administrer le rappel directement s'il n'est pas encore administré */}
                                  {!isRappelAdministered && rappel.vaccin_id && (
                                    <button
                                      onClick={() => handleAdministerRappel(groupedVaccine.vaccine.id, String(rappel.vaccin_id))}
                                      className="ml-auto bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded-full transition-colors"
                                      title="Administrer ce rappel"
                                    >
                                      Administrer
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleDeleteVaccine(groupedVaccine.vaccine.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Supprimer ce vaccin"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Onglet Vaccins en retard */}
        {activeTab === "overdue" && (
          <div>
            {overdueVaccines.length === 0 ? (
              <div className="text-center py-6 animate-pulse">
                <div className="h-16 w-16 text-green-500 mx-auto mb-3 flex items-center justify-center bg-green-50 rounded-full p-3 border-2 border-green-200">
                  <ShieldCheckIcon className="h-12 w-12" />
                </div>
                <p className="text-green-600 text-lg font-semibold">
                  Tous les vaccins sont à jour pour cet enfant
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 bg-gray-50 rounded-lg p-2">
                <div className="space-y-3">
                  {overdueVaccines.map((vaccine) => (
                    <div
                      key={`overdue-${vaccine.id}`}
                      className="relative bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500 group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <ShieldCheckIcon className="h-5 w-5 text-orange-600" />
                          {vaccine.name || "Vaccin sans nom"}
                        </h3>
                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-0.5 rounded-full">En retard</span>
                      </div>
                      
                      <div className="bg-orange-50 px-3 py-2 rounded-md border border-orange-100 my-2">
                        <p className="text-gray-700 flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-orange-600" />
                          <span className="font-medium">Âge recommandé:</span> 
                          <span className="text-orange-700">
                            {vaccine.Age_Annees > 0 ? `${vaccine.Age_Annees} ${vaccine.Age_Annees > 1 ? 'années' : 'année'}` : ''}{vaccine.Age_Annees > 0 && (vaccine.Age_Mois > 0 || vaccine.Age_Jours > 0) ? ' - ' : ''}{vaccine.Age_Mois > 0 ? `${vaccine.Age_Mois} ${vaccine.Age_Mois > 1 ? 'mois' : 'mois'}` : ''}{vaccine.Age_Mois > 0 && vaccine.Age_Jours > 0 ? ' - ' : ''}{vaccine.Age_Jours > 0 ? `${vaccine.Age_Jours} ${vaccine.Age_Jours > 1 ? 'jours' : 'jour'}` : ''}
                          </span>
                        </p>
                      </div>
                      
                      {vaccine.Description && (
                        <p className="text-gray-600 mt-2 text-sm italic bg-gray-50 p-2 rounded">{vaccine.Description}</p>
                      )}
                      
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => setSelectedVaccine(vaccine.id)}
                          className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Programmer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Onglet Vaccins à suivre */}
        {activeTab === "upcoming" && (
          <div>
            {filteredUpcomingVaccines.length === 0 ? (
              <div className="text-center py-6">
                <CalendarIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <p className="text-gray-600 text-lg">
                  Aucun vaccin à suivre pour cet enfant
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 bg-gray-50 rounded-lg p-2">
                <div className="space-y-3">
                  {filteredUpcomingVaccines.map((vaccine) => (
                    <div
                      key={`upcoming-${vaccine.id}`}
                      className="relative bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500 group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                          {vaccine.name}
                        </h3>
                        <span className={`${vaccine.type === 'rappel' ? 'bg-purple-100 text-purple-800' : vaccine.strict ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} text-xs font-bold px-2.5 py-0.5 rounded-full`}>
                          {vaccine.type === 'rappel' ? 'Rappel' : vaccine.strict ? 'Strict' : 'Recommandé'}
                        </span>
                      </div>
                      
                      <div className="bg-blue-50 px-3 py-2 rounded-md border border-blue-100 my-2">
                        <p className="text-gray-700 flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Jours restants:</span> 
                          <span className="text-blue-700">
                            {vaccine.days_remaining}
                          </span>
                        </p>
                        <p className="text-gray-700 flex items-center gap-2 mt-2">
                          <CalendarIcon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Date estimée:</span> 
                          <span className="text-blue-700">
                            {format(
                              new Date(Date.now() + vaccine.days_remaining * 24 * 60 * 60 * 1000),
                              "dd/MM/yyyy"
                            )}
                          </span>
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 px-3 py-2 rounded-md border border-gray-100 my-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Délai requis:</span> 
                          <span className="text-gray-700 ml-2">
                            {vaccine.delai} jours
                          </span>
                        </p>
                      </div>
                      
                      {/* Affichage des rappels à venir pour ce vaccin */}
                      {upcomingVaccineRappels[vaccine.id] && upcomingVaccineRappels[vaccine.id].length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <RefreshIcon className="h-4 w-4 text-blue-600" /> Rappels prévus:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {upcomingVaccineRappels[vaccine.id]
                              // Trier les rappels par délai croissant pour afficher les rappels dans l'ordre
                              .sort((a, b) => a.delai - b.delai)
                              // Filtrer uniquement les rappels non administrés
                              .filter((rappel) => {
                                // Vérifier si ce rappel a déjà été administré
                                // Pour les rappels des vaccins à venir, nous devons vérifier dans les vaccins déjà administrés
                                const parentVaccine = vaccines.find(v => v.vaccin_id === vaccine.vaccin_id);
                                
                                if (parentVaccine) {
                                  // Si le vaccin parent existe, vérifier si ce rappel spécifique a été administré
                                  const rappelIndex = vaccineRappels[parentVaccine.id]?.findIndex(
                                    r => r.vaccin_id === rappel.vaccin_id || r.delai === rappel.delai
                                  );
                                  
                                  if (rappelIndex !== -1 && rappelIndex !== undefined) {
                                    // Vérifier si ce rappel a été administré
                                    return !administeredRappels[parentVaccine.id]?.[rappelIndex];
                                  }
                                }
                                
                                // Si on ne peut pas déterminer si le rappel a été administré, l'afficher par défaut
                                return true;
                              })
                              .map((rappel, index) => (
                              <div 
                                key={`${vaccine.id}-upcoming-rappel-${index}`}
                                className="bg-blue-50 px-3 py-1 rounded-md border border-blue-100 flex items-center gap-1 text-xs"
                              >
                                <ClockOutlineIcon className="h-3 w-3 text-blue-600" />
                                <span>
                                  {rappel.delai === 0 ? 'Immédiat' : `J+${rappel.delai}`}
                                  {rappel.description && ` - ${rappel.description}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Section des rappels avec type "Rappels" */}
                      
                      
                      {/* Bouton pour programmer le vaccin */}
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleVaccineSelection(vaccine.id)}
                          className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Programmer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Combobox et boutons conditionnels */}
      {showCombobox && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Sélectionnez un vaccin
          </h3>
          <div className="relative">
            <select
              onChange={(e) => handleVaccineSelection(e.target.value)}
              value={selectedVaccine || ''}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-600 bg-white text-gray-900"
            >
              <option value="" disabled>Sélectionnez un vaccin</option>
              {availableVaccines && availableVaccines.map((vaccine: any) => (
                <option
                  key={`select-${vaccine.id}`}
                  value={vaccine.id}
                >
                  {vaccine.Nom}
                </option>
              ))}
            </select>
          </div>
          
          {/* Affichage des avertissements de prérequis */}
          {prerequisiteWarning && selectedVaccine && (
            <div className={`mt-4 p-4 rounded-lg ${prerequisiteWarning.canBeAdministered ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-medium mb-2 ${prerequisiteWarning.canBeAdministered ? 'text-yellow-700' : 'text-red-700'}`}>
                {prerequisiteWarning.message}
              </p>
              
              {prerequisiteWarning.missingPrerequisites && prerequisiteWarning.missingPrerequisites.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-700 font-medium mb-1">Prérequis manquants:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {prerequisiteWarning.missingPrerequisites.map((prereq: any) => (
                      <li key={`prereq-${prereq.id}`} className={prereq.strict ? 'text-red-600 font-medium' : 'text-yellow-600'}>
                        {prereq.name} {prereq.strict ? '(obligatoire)' : '(recommandé)'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {selectedVaccine && (
            <div className="mt-4 flex gap-4">
              <button
                onClick={handleAddVaccine}
                disabled={
                  Boolean(prerequisiteWarning && !prerequisiteWarning.canBeAdministered) ||
                  Boolean(selectedVaccine && fullyAdministeredVaccines[selectedVaccine]) ||
                  Boolean(selectedVaccine && maxRappelsInfo[selectedVaccine]?.maxReached)
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md ${
                  (prerequisiteWarning && !prerequisiteWarning.canBeAdministered) || 
                  (selectedVaccine && fullyAdministeredVaccines[selectedVaccine]) ||
                  (selectedVaccine && maxRappelsInfo[selectedVaccine]?.maxReached)
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <PlusIcon className="h-5 w-5" /> 
                {selectedVaccine && fullyAdministeredVaccines[selectedVaccine] 
                  ? "Toutes les doses administrées" 
                  : selectedVaccine && maxRappelsInfo[selectedVaccine]?.maxReached
                    ? `Maximum atteint (${maxRappelsInfo[selectedVaccine]?.currentCount}/${maxRappelsInfo[selectedVaccine]?.maxAllowed})` 
                    : "Confirmer l'ajout"}
              </button>
              <button
                onClick={() => setShowCombobox(false)}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChildVaccinations;