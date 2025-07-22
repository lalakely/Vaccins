import {
  MapIcon,
  CursorArrowRippleIcon,
  UsersIcon,
  TrashIcon,
  ChartBarIcon
} from "@heroicons/react/24/solid";
import VaccineCoverageChart from "../charts/VaccineCoverageChart";
import axios from "axios";
import { buildApiUrl } from "../../config/api";
import { useState, useEffect, useRef } from "react";
import useNotificationService from "../../hooks/useNotificationService";
import EditHameau from "./EditHameau";
import LocationMap from "../shared/LocationMap";
import {
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";


interface HameauPopupProps {
  hameau: {
    id?: number;
    ID?: number;
    Nom: string;
    px: number;
    py: number;
    nombre_personne?: number;
    nombre_enfant?: number;
    nombre_enfant_vaccines?: number;
    [key: string]: any;
  };
  onClose: () => void;
}

function HameauPopup({ hameau, onClose }: HameauPopupProps) {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [vaccinationStats, setVaccinationStats] = useState<{total: number, vaccinated: number, percentage: number}>({total: 0, vaccinated: 0, percentage: 0});
  const [chartLoading, setChartLoading] = useState(true);
  const { showSuccess, showError, showWarning } = useNotificationService();
  const warningShown = useRef<boolean>(false); // Pour suivre si l'avertissement a déjà été affiché
  const errorShown = useRef<boolean>(false); // Pour éviter d'afficher plusieurs fois la même erreur
  
  // Configuration du graphique
  const chartConfig = {
    value: {
      label: "Pourcentage Vaccinés",
    },
  } satisfies ChartConfig;

  // Fonction pour récupérer les données de vaccination
  const fetchVaccinationData = async () => {
    if (!hameau?.ID && !hameau?.id) return;
    
    try {
      setChartLoading(true);
      
      // Utiliser un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
      
      const response = await axios.get(buildApiUrl(`/api/hameau/${hameau.ID || hameau.id}/stats`), {
        signal: controller.signal,
        timeout: 5000 // Timeout de 5 secondes (redondant avec AbortController mais plus sûr)
      });
      
      clearTimeout(timeoutId);
      
      if (response.data) {
        const { total_enfants, enfants_vaccines } = response.data;
        const percentage = total_enfants > 0 ? Math.round((enfants_vaccines / total_enfants) * 100) : 0;
        
        // Préparer les données de statistiques
        const stats = {
          total: total_enfants,
          vaccinated: enfants_vaccines,
          percentage: percentage
        };
        
        // Sauvegarder dans le cache local pour une utilisation hors ligne
        try {
          const cacheKey = `hameau_stats_${hameau.ID || hameau.id}`;
          localStorage.setItem(cacheKey, JSON.stringify(stats));
          console.log('Données de vaccination sauvegardées dans le cache pour le hameau:', hameau.Nom);
        } catch (cacheError) {
          console.error('Erreur lors de la sauvegarde des données dans le cache:', cacheError);
        }
        
        setVaccinationStats(stats);
        
        setChartData([
          {
            name: "Vaccinés",
            value: percentage,
            fill: "hsl(var(--chart-1))"
          }
        ]);
        
        // Afficher une notification si le taux de vaccination est faible (une seule fois)
        if (percentage < 50 && !warningShown.current) {
          showWarning("Couverture vaccinale faible", 
            `Le taux de vaccination dans le hameau ${hameau.Nom} est de ${percentage}%, en dessous de l'objectif de 80%`, {
            category: "statistics",
            actionLink: `/Hameau?id=${hameau.ID || hameau.id}`,
            entityType: "hameau",
            entityId: hameau.ID || hameau.id
          });
          warningShown.current = true; // Marquer que l'avertissement a été affiché
        }
      }
    } catch (error: any) {
      
      // Gérer les différents types d'erreurs
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
        console.warn("Timeout lors de la récupération des statistiques du hameau:", error);
        // Utiliser des données en cache
        loadCachedData();
      } else if (error.response) {
        // Erreur avec réponse du serveur (400, 404, 500, etc.)
        console.warn(`Erreur ${error.response.status} lors de la récupération des statistiques du hameau:`, error);
        loadCachedData();
        
        // N'afficher l'erreur qu'une seule fois
        if (!errorShown.current) {
          showError("Erreur de chargement", `Impossible de charger les statistiques du hameau. Mode hors ligne activé.`);
          errorShown.current = true;
        }
      } else {
        console.error("Erreur lors du chargement des statistiques :", error);
        loadCachedData();
      }
    } finally {
      setChartLoading(false);
    }
  };
  
  // Fonction pour utiliser les données en cache si disponibles
  const loadCachedData = () => {
    try {
      const cacheKey = `hameau_stats_${hameau.ID || hameau.id}`;
      const cachedStats = localStorage.getItem(cacheKey);
      
      if (cachedStats) {
        const stats = JSON.parse(cachedStats);
        setVaccinationStats({
          total: stats.total,
          vaccinated: stats.vaccinated,
          percentage: stats.percentage
        });
        
        setChartData([
          {
            name: "Vaccinés (données locales)",
            value: stats.percentage,
            fill: "hsl(var(--chart-1))"
          }
        ]);
        console.log('Données de vaccination chargées depuis le cache pour le hameau:', hameau.Nom);
        return true;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données en cache:', error);
    }
    
    // Si aucune donnée en cache n'est disponible, utiliser des estimations basées sur les propriétés du hameau
    if (hameau.nombre_enfant && hameau.nombre_enfant_vaccines) {
      const percentage = Math.round((hameau.nombre_enfant_vaccines / hameau.nombre_enfant) * 100);
      
      setVaccinationStats({
        total: hameau.nombre_enfant,
        vaccinated: hameau.nombre_enfant_vaccines,
        percentage: percentage
      });
      
      setChartData([
        {
          name: "Vaccinés (estimé)",
          value: percentage,
          fill: "hsl(var(--chart-1))"
        }
      ]);
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    fetchVaccinationData();
  }, [hameau]);

  if (!hameau) return null;

  const handleDelete = async () => {
    if (!hameau?.id) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le hameau "${hameau.Nom}" ?`)) {
      return;
    }

    setLoading(true);

    try {
      // Utiliser un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
      
      await axios.delete(buildApiUrl(`/api/hameau/${hameau.id}`), {
        signal: controller.signal,
        timeout: 5000 // Timeout de 5 secondes
      });
      
      clearTimeout(timeoutId);
      
      showSuccess("Suppression réussie", `Le hameau ${hameau.Nom} a été supprimé avec succès`, {
        actionLink: "/Hameau",
        entityType: "hameau",
        entityId: hameau.id
      });
      onClose();
      
      // Rafraîchir la page après une courte pause pour permettre à la notification de s'afficher
      setTimeout(() => {
        window.location.href = "/Hameau";
      }, 500);
    } catch (error: any) {
      console.error("Erreur réseau :", error);
      
      // Gérer les différents types d'erreurs
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
        showError("Erreur de connexion", "Le serveur met trop de temps à répondre. Veuillez réessayer plus tard.");
      } else if (error.response) {
        // Erreur avec réponse du serveur (400, 404, 500, etc.)
        showError("Erreur de suppression", `Impossible de supprimer le hameau (${error.response.status}). Veuillez réessayer plus tard.`);
      } else {
        showError("Erreur de suppression", "Impossible de supprimer le hameau. Veuillez réessayer plus tard.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        
        
        <div className="p-6 sm:p-8 flex flex-col gap-8">
          {/* Ligne 1 - Informations et graphique de pourcentage */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Colonne de gauche - Informations */}
            <div className="flex-1 space-y-4 text-gray-800">
              <div className="flex items-start gap-2">
                <MapIcon className="h-5 w-5 text-green-500 mt-1" />
                <span><span className="font-semibold">Nom :</span> {hameau.Nom}</span>
              </div>
              
              <div className="flex items-start gap-2">
                <CursorArrowRippleIcon className="h-5 w-5 text-green-500 mt-1" />
                <span><span className="font-semibold">Coordonnées :</span> ({hameau.px}, {hameau.py})</span>
              </div>
              
              <div className="mt-6 border border-gray-100 rounded-lg p-4 bg-white">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <CursorArrowRippleIcon className="h-6 w-6 mr-2 text-blue-500" />
                  Localisation
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-4">
                      <span className="block text-sm text-gray-600 mb-1">
                        <strong className="text-gray-700">Longitude:</strong> {Number(hameau.px).toFixed(6)}
                      </span>
                      <span className="block text-sm text-gray-600 mb-1">
                        <strong className="text-gray-700">Latitude:</strong> {Number(hameau.py).toFixed(6)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>Cliquez sur la carte pour agrandir et voir plus de détails.</p>
                    </div>
                  </div>
                  
                  <div className="h-[200px] border border-gray-200 rounded-lg overflow-hidden">
                    <LocationMap 
                      initialPosition={[Number(hameau.py), Number(hameau.px)]} 
                      height="100%" 
                      readOnly={true}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <UsersIcon className="h-5 w-5 text-green-500 mt-1" />
                <span><span className="font-semibold">Nombre d'habitants :</span> {hameau.nombre_personne || "Non spécifié"}</span>
              </div>
              
              <div className="flex items-start gap-2">
                <UsersIcon className="h-5 w-5 text-blue-500 mt-1" />
                <span>
                  <span className="font-semibold">Nombre d'enfants :</span> {vaccinationStats.total}
                </span>
              </div>
              
              <div className="flex items-start gap-2">
                <ChartBarIcon className="h-5 w-5 text-green-500 mt-1" />
                <span>
                  <span className="font-semibold">Enfants vaccinés :</span> {vaccinationStats.vaccinated}
                </span>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {/* Composant d'édition */}
                <EditHameau 
                  hameau={hameau} 
                  onEditSuccess={() => {
                    onClose();
                    window.location.reload();
                  }}
                />
                
                {/* Bouton de suppression */}
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors rounded-full"
                >
                  <TrashIcon className="h-5 w-5" />
                  {loading ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
            
            {/* Colonne de droite - Graphique */}
            <div className="flex-1">
              <Card className="w-full">
                <CardContent className="pt-6">
                  {chartLoading ? (
                    <div className="h-64 flex items-center justify-center">Chargement...</div>
                  ) : (
                    <ChartContainer config={chartConfig} className="w-full aspect-square max-h-[250px]">
                      <RadialBarChart
                        innerRadius="30%"
                        outerRadius="100%"
                        data={chartData}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          angleAxisId={0}
                          tick={false}
                        />
                        <RadialBar
                          background
                          dataKey="value"
                          cornerRadius={30}
                          strokeWidth={2}
                          label={{
                            position: "center",
                            fill: "#666",
                            formatter: () => `${vaccinationStats.percentage}%`,
                          }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={false}
                          axisLine={false}
                        />
                      </RadialBarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
              
              <div className="text-sm text-gray-500 mt-2 text-center">
                Pourcentage d'enfants ayant reçu au moins un vaccin
              </div>
            </div>
          </div>
          
          {/* Ligne 2 - Graphique de couverture vaccinale par vaccin */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-4">Couverture vaccinale par vaccin</h3>
            <VaccineCoverageChart 
              entityType="hameau" 
              entityId={hameau.ID || hameau.id || 0} 
              className="w-full" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HameauPopup;
