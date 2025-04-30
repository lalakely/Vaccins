"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

function VaccinationRatio() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasVaccinations, setHasVaccinations] = React.useState(true);

  // Configuration des couleurs et labels pour le graphique
  const chartConfig = {
    vaccines: {
      label: "Vaccinés",
      color: "hsl(var(--chart-1))",
    },
    nonVaccines: {
      label: "Non Vaccinés",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const enfantsRes = await fetch("http://localhost:3000/api/enfants");
        const vaccinationsRes = await fetch("http://localhost:3000/api/vaccinations");

        if (!enfantsRes.ok) throw new Error(`Erreur enfants: ${enfantsRes.status}`);
        if (!vaccinationsRes.ok) throw new Error(`Erreur vaccinations: ${vaccinationsRes.status}`);

        const enfants = await enfantsRes.json();
        const vaccinations = await vaccinationsRes.json();

        // Calcul des ratios par Fokotany
        const ratioByFokotany = enfants.reduce((acc: any, enfant: any) => {
          acc[enfant.Fokotany] = acc[enfant.Fokotany] || { total: 0, vaccines: 0 };
          acc[enfant.Fokotany].total++;
          if (vaccinations.some((v: any) => v.enfant_id === enfant.id)) acc[enfant.Fokotany].vaccines++;
          return acc;
        }, {});

        // Transformer en format pour Recharts
        const data = Object.keys(ratioByFokotany).map((fokotany) => ({
          fokotany,
          vaccines: ratioByFokotany[fokotany].vaccines,
          nonVaccines: ratioByFokotany[fokotany].total - ratioByFokotany[fokotany].vaccines,
        }));

        // Vérifier si des vaccinations existent
        if (vaccinations.length === 0 || data.every((item) => item.vaccines === 0)) {
          setHasVaccinations(false);
          setChartData([
            {
              fokotany: "Aucune donnée",
              vaccines: 0,
              nonVaccines: enfants.length || 1, // Si pas d'enfants, met 1 pour afficher quelque chose
            },
          ]);
        } else {
          setHasVaccinations(true);
          setChartData(data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setHasVaccinations(false);
        setChartData([
          {
            fokotany: "Erreur",
            vaccines: 0,
            nonVaccines: 1,
          },
        ]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vaccinés vs Non Vaccinés par Fokotany</CardTitle>
        <CardDescription>Répartition des enfants par statut vaccinal</CardDescription>
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
                dataKey="fokotany"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="vaccines"
                fill={chartConfig.vaccines.color}
                stackId="a"
                name={chartConfig.vaccines.label}
              />
              <Bar
                dataKey="nonVaccines"
                fill={chartConfig.nonVaccines.color}
                stackId="a"
                name={chartConfig.nonVaccines.label}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default VaccinationRatio;