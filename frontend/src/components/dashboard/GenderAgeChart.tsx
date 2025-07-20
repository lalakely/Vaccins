import { buildApiUrl } from "../../config/api";
"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

function GenderAgeChart() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Configuration des couleurs et labels pour le graphique
  const chartConfig = {
    masculin: {
      label: "Masculin",
      color: "hsl(var(--chart-1))",
    },
    feminin: {
      label: "Féminin",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(buildApiUrl("/api/enfants"));

        if (!res.ok) throw new Error(`Erreur enfants: ${res.status}`);

        const enfants = await res.json();

        // Calcul des répartitions par sexe et âge
        const genderAge = enfants.reduce(
          (acc: any, enfant: any) => {
            const age = new Date().getFullYear() - new Date(enfant.date_naissance).getFullYear();
            const key = enfant.SEXE === "M" ? "Masculin" : "Féminin";
            acc[key] = acc[key] || { "0-2": 0, "3-5": 0, "6+": 0 };
            if (age <= 2) acc[key]["0-2"]++;
            else if (age <= 5) acc[key]["3-5"]++;
            else acc[key]["6+"]++;
            return acc;
          },
          { Masculin: { "0-2": 0, "3-5": 0, "6+": 0 }, Féminin: { "0-2": 0, "3-5": 0, "6+": 0 } }
        );

        // Transformer en format pour Recharts
        const data = [
          {
            age: "0-2 ans",
            masculin: genderAge.Masculin["0-2"],
            feminin: genderAge.Féminin["0-2"],
          },
          {
            age: "3-5 ans",
            masculin: genderAge.Masculin["3-5"],
            feminin: genderAge.Féminin["3-5"],
          },
          {
            age: "6+ ans",
            masculin: genderAge.Masculin["6+"],
            feminin: genderAge.Féminin["6+"],
          },
        ];

        setChartData(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setChartData([
          { age: "Erreur", masculin: 0, feminin: 0 },
        ]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par Sexe et Âge</CardTitle>
        <CardDescription>Enfants par tranche d’âge et sexe</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">Chargement...</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="age"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="masculin"
                fill="var(--color-masculin)"
                radius={4}
                name={chartConfig.masculin.label}
              />
              <Bar
                dataKey="feminin"
                fill="var(--color-feminin)"
                radius={4}
                name={chartConfig.feminin.label}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Données à jour <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Répartition actuelle des enfants par sexe et âge
        </div>
      </CardFooter>
    </Card>
  );
}

export default GenderAgeChart;