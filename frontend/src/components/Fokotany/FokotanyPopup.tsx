import {
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  CursorArrowRippleIcon,
  TrashIcon
} from "@heroicons/react/24/solid";
import { RadialBarChart, RadialBar, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import axios from "axios";
import { buildApiUrl } from "../../config/api";
import { useState, useEffect, useRef } from "react";
import useNotificationService from "../../hooks/useNotificationService";
import {
  ChartConfig,
  ChartContainer
} from "@/components/ui/chart";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import VaccineCoverageChart from "../charts/VaccineCoverageChart";

interface FokotanyPopupProps {
  fokotany: {
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

function FokotanyPopup({ fokotany, onClose }: FokotanyPopupProps) {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [vaccinationStats, setVaccinationStats] = useState<{total: number, vaccinated: number, percentage: number}>({total: 0, vaccinated: 0, percentage: 0});
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const { showSuccess, showError, showWarning } = useNotificationService();
  const warningShown = useRef<boolean>(false); // Pour suivre si l'avertissement a déjà été affiché
  const errorShown = useRef<boolean>(false); // Pour éviter d'afficher plusieurs fois la même erreur

  // Configuration du graphique
  const chartConfig = {
    value: {
      label: "Vaccination",
      color: "hsl(var(--chart-1))"
    },
  } satisfies ChartConfig;

  // Fonction pour récupérer les données de vaccination
  const fetchVaccinationData = async () => {
    if (!fokotany?.ID) return;
    
    try {
      setChartLoading(true);
      
      // Utiliser un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
      
      const response = await axios.get(buildApiUrl(`/api/fokotany/${fokotany.ID}/stats`), {
        signal: controller.signal,
        timeout: 5000 // Timeout de 5 secondes (redondant avec AbortController mais plus sûr)
      });
      
      clearTimeout(timeoutId);
      
      if (response.data) {
        const { total_enfants, enfants_vaccines } = response.data;
        const percentage = total_enfants > 0 ? Math.round((enfants_vaccines / total_enfants) * 100) : 0;
        
        setVaccinationStats({
          total: total_enfants,
          vaccinated: enfants_vaccines,
          percentage: percentage
        });
        
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
            `Le taux de vaccination dans le fokotany ${fokotany.Nom} est de ${percentage}%, en dessous de l'objectif de 80%`, {
            category: "statistics",
            actionLink: `/Fokotany?id=${fokotany.ID}`,
            entityType: "fokotany",
            entityId: fokotany.ID
          });
          warningShown.current = true; // Marquer que l'avertissement a été affiché
        }
      }
    } catch (error: any) {
      
      // Gérer les différents types d'erreurs
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
        console.warn("Timeout lors de la récupération des statistiques du fokotany:", error);
        // Utiliser des données de démo
        setDemoData();
      } else if (error.response) {
        // Erreur avec réponse du serveur (400, 404, 500, etc.)
        console.warn(`Erreur ${error.response.status} lors de la récupération des statistiques du fokotany:`, error);
        setDemoData();
        
        // N'afficher l'erreur qu'une seule fois
        if (!errorShown.current) {
          showError("Erreur de chargement", `Impossible de charger les statistiques du fokotany. Mode démo activé.`);
          errorShown.current = true;
        }
      } else {
        console.error("Erreur lors du chargement des statistiques :", error);
        setDemoData();
      }
    } finally {
      setChartLoading(false);
    }
  };
  
  // Fonction pour définir des données de démo en cas d'erreur
  const setDemoData = () => {
    // Générer un pourcentage aléatoire entre 30 et 80%
    const percentage = Math.floor(Math.random() * 50) + 30;
    
    setVaccinationStats({
      total: fokotany.nombre_enfant || 10,
      vaccinated: Math.floor((fokotany.nombre_enfant || 10) * percentage / 100),
      percentage: percentage
    });
    
    setChartData([
      {
        name: "Vaccinés (démo)",
        value: percentage,
        fill: "hsl(var(--chart-1))"
      }
    ]);
  };

  useEffect(() => {
    fetchVaccinationData();
  }, [fokotany]);

  if (!fokotany) return null;

  const handleDelete = async () => {
    if (!fokotany?.ID) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le fokotany "${fokotany.Nom}" ?`)) {
      return;
    }

    setLoading(true);

    try {
      // Utiliser un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
      
      await axios.delete(buildApiUrl(`fokotany/${fokotany.ID}`), {
        signal: controller.signal,
        timeout: 5000 // Timeout de 5 secondes
      });
      
      clearTimeout(timeoutId);
      
      showSuccess("Suppression réussie", `Le fokotany ${fokotany.Nom} a été supprimé avec succès`, {
        actionLink: "/Fokotany",
        entityType: "fokotany",
        entityId: fokotany.ID
      });
      onClose();
      
      // Rafraîchir la page après une courte pause pour permettre à la notification de s'afficher
      setTimeout(() => {
        window.location.href = "/Fokotany";
      }, 500);
    } catch (error: any) {
      console.error("Erreur réseau :", error);
      
      // Gérer les différents types d'erreurs
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
        showError("Erreur de connexion", "Le serveur met trop de temps à répondre. Veuillez réessayer plus tard.");
      } else if (error.response) {
        // Erreur avec réponse du serveur (400, 404, 500, etc.)
        showError("Erreur de suppression", `Impossible de supprimer le fokotany (${error.response.status}). Veuillez réessayer plus tard.`);
      } else {
        showError("Erreur de suppression", "Impossible de supprimer le fokotany. Veuillez réessayer plus tard.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <div className="p-6 sm:p-8 flex flex-col gap-8">
          {/* Ligne 1 - Informations et graphique de pourcentage */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Colonne de gauche - Informations */}
            <div className="flex-1 space-y-4 text-gray-800">
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-5 w-5 text-green-500 mt-1" />
                <span><span className="font-semibold">Nom :</span> {fokotany.Nom}</span>
              </div>
              
              <div className="flex items-start gap-2">
                <CursorArrowRippleIcon className="h-5 w-5 text-green-500 mt-1" />
                <span><span className="font-semibold">Coordonnées :</span> ({fokotany.px}, {fokotany.py})</span>
              </div>
              
              <div className="flex items-start gap-2">
                <UserGroupIcon className="h-5 w-5 text-green-500 mt-1" />
                <span>
                  <span className="font-semibold">Nombre d'habitants :</span> {fokotany.nombre_personne || "Non spécifié"}
                </span>
              </div>
              
              <div className="flex items-start gap-2">
                <UserGroupIcon className="h-5 w-5 text-blue-500 mt-1" />
                <span>
                  <span className="font-semibold">Nombre d'enfants :</span> {vaccinationStats.total}
                </span>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1 bg-color-blue" />
                <span>
                  <span className="font-semibold">Enfants vaccinés :</span> {vaccinationStats.vaccinated}
                </span>
              </div>
              
              <div className="mt-6">
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
              entityType="fokotany" 
              entityId={fokotany.ID || fokotany.id || 0} 
              className="w-full" 
            />
          </div>
        </div>
    </div>
  );
}

export default FokotanyPopup;
