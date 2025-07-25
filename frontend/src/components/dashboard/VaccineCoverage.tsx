import { buildApiUrl } from "../../config/api";
"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

function VaccineCoverage() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasVaccinations, setHasVaccinations] = React.useState(true); // Nouvel état pour vérifier les vaccinations

  // Configuration des couleurs pour le graphique
  const chartConfig = {
    value: {
      label: "Vaccinations",
    },
  } satisfies ChartConfig;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupération des vaccins avec gestion d'erreur
        let vaccins: any[] = [];
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const vaccinsRes = await fetch(buildApiUrl("/api/vaccins"), {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (vaccinsRes.ok) {
            vaccins = await vaccinsRes.json();
          } else {
            console.warn(`Erreur ${vaccinsRes.status} lors de la récupération des vaccins`);
          }
        } catch (vaccinsError) {
          console.warn("Impossible de récupérer la liste des vaccins:", vaccinsError);
          // Continuer avec une liste vide de vaccins
        }
        
        // Récupération des vaccinations avec gestion d'erreur
        let vaccinations: any[] = [];
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const vaccinationsRes = await fetch(buildApiUrl("/api/vaccinations"), {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (vaccinationsRes.ok) {
            vaccinations = await vaccinationsRes.json();
          } else {
            console.warn(`Erreur ${vaccinationsRes.status} lors de la récupération des vaccinations`);
          }
        } catch (vaccinationsError) {
          console.warn("Impossible de récupérer les vaccinations:", vaccinationsError);
          // Continuer avec une liste vide de vaccinations
        }

        // Vérifier si des vaccinations existent et si on a des vaccins
        if (vaccins.length === 0) {
          setHasVaccinations(false);
          setChartData([
            {
              name: "Données indisponibles",
              value: 1,
              fill: "hsl(var(--chart-3))",
            },
          ]);
          return;
        }

        // Calculer la couverture
        const coverage = vaccins.map((v: any, index: number) => ({
          name: v.Nom,
          value: vaccinations.filter((vac: any) => vac.vaccin_id === v.id).length,
          fill: `hsl(var(--chart-${(index % 5) + 1}))`,
        }));

        // Si aucune vaccination ou toutes les valeurs sont à 0
        if (vaccinations.length === 0 || coverage.every((item: any) => item.value === 0)) {
          setHasVaccinations(false);
          setChartData([
            {
              name: "Aucune vaccination",
              value: 1, // Valeur fictive pour afficher le graphique
              fill: "hsl(var(--chart-1))",
            },
          ]);
        } else {
          setHasVaccinations(true);
          setChartData(coverage);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setHasVaccinations(false);
        setChartData([
          {
            name: "Erreur de chargement",
            value: 1,
            fill: "hsl(var(--chart-1))",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcul du total des vaccinations
  const totalVaccinations = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Couverture Vaccinale</CardTitle>
        <CardDescription>Données des Vaccinations</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="h-64 flex items-center justify-center">Chargement...</div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {!hasVaccinations ? (
                            <>
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-xl font-bold"
                              >
                                0
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Aucune vaccination
                              </tspan>
                            </>
                          ) : (
                            <>
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalVaccinations.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Vaccinations
                              </tspan>
                            </>
                          )}
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {hasVaccinations ? (
            <>
              Couverture vaccinale à jour <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            "Aucune donnée de vaccination disponible"
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Nombre total de vaccinations par vaccin
        </div>
      </CardFooter>
    </Card>
  );
}

export default VaccineCoverage;