"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

export function VaccinationPercentage() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Configuration du graphique
  const chartConfig = {
    value: {
      label: "Pourcentage Vaccinés",
    },
    vaccinated: {
      label: "Vaccinés",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const enfantsRes = await fetch("http://localhost:3000/api/enfants");
        const vaccinationsRes = await fetch("http://localhost:3000/api/vaccinations");

        if (!enfantsRes.ok || !vaccinationsRes.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const enfants = await enfantsRes.json();
        const vaccinations = await vaccinationsRes.json();

        // Calcul du nombre d'enfants vaccinés (au moins une vaccination)
        const enfantsVaccinesIds = new Set(vaccinations.map((vac: any) => vac.enfant_id));
        const enfantsVaccinesCount = enfantsVaccinesIds.size;
        const totalEnfants = enfants.length;

        // Calcul du pourcentage
        const percentageVaccinated = totalEnfants > 0 ? (enfantsVaccinesCount / totalEnfants) * 100 : 0;

        setChartData([
          {
            name: "vaccinated",
            value: percentageVaccinated,
            fill: "var(--color-vaccinated)",
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setChartData([
          {
            name: "vaccinated",
            value: 0,
            fill: "hsl(var(--chart-1))",
          },
        ]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pourcentage d'Enfants Vaccinés</CardTitle>
        <CardDescription>Comparaison avec les non vaccinés</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">Chargement...</div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
            <RadialBarChart
              data={chartData}
              startAngle={0}
              endAngle={360 * (chartData[0]?.value / 100)} // Ajuste l'angle selon le pourcentage
              innerRadius={80}
              outerRadius={110}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={[86, 74]}
              />
              <RadialBar dataKey="value" background cornerRadius={10} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-4xl font-bold"
                          >
                            {chartData[0].value.toFixed(1)}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Vaccinés
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Taux de vaccination actuel <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Pourcentage d'enfants ayant reçu au moins un vaccin
        </div>
      </CardFooter>
    </Card>
  );
}

export default VaccinationPercentage;