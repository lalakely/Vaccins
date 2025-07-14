import {
  MapIcon,
  CursorArrowRippleIcon,
  UsersIcon,
  TrashIcon,
  ChartBarIcon
} from "@heroicons/react/24/solid";
import VaccineCoverageChart from "../charts/VaccineCoverageChart";
import axios from "axios";
import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
      
      const response = await axios.get(`http://localhost:3000/api/hameau/${hameau.ID || hameau.id}/stats`);
      
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
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques :", error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinationData();
  }, [hameau]);

  if (!hameau) return null;

  const handleDelete = async () => {
    if (!hameau?.ID && !hameau?.id) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le hameau "${hameau.Nom}" ?`)) {
      return;
    }

    setLoading(true);

    try {
      await axios.delete(`http://localhost:3000/api/hameau/${hameau.ID || hameau.id}`);
      alert("Hameau supprimé avec succès !");
      onClose();
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Échec de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MapIcon className="h-6 w-6 text-green-500" />
            Détails du Hameau: {hameau.Nom}
          </DialogTitle>
        </DialogHeader>
        
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
              
              <div className="flex items-start gap-2">
                <UsersIcon className="h-5 w-5 text-green-500 mt-1" />
                <span>
                  <span className="font-semibold">Nombre d'habitants :</span> {hameau.nombre_personne || "Non spécifié"}
                </span>
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
              
              <div className="mt-6">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
      </DialogContent>
    </Dialog>
  );
}

export default HameauPopup;
