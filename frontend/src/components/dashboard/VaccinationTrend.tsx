import { buildApiUrl } from "../../config/api";
"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

function VaccinationTrend() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Configuration des couleurs et labels pour le graphique
  const chartConfig = {
    vaccinations: {
      label: "Vaccinations",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(buildApiUrl("/api/vaccinations"));

        if (!res.ok) throw new Error(`Erreur vaccinations: ${res.status}`);

        const vaccinations = await res.json();

        // Calcul des tendances par mois
        const trend = vaccinations.reduce((acc: any, vac: any) => {
          const month = new Date(vac.date_vaccination).toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        // Transformer en format pour Recharts
        const data = Object.keys(trend).map((month) => ({
          month,
          vaccinations: trend[month],
        }));

        setChartData(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setChartData([{ month: "Erreur", vaccinations: 0 }]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des Vaccinations</CardTitle>
        <CardDescription>Nombre de vaccinations par jour</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">Chargement...</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toLocaleString("default", { day: "numeric" })}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="vaccinations"
                type="natural"
                fill="var(--color-vaccinations)"
                fillOpacity={0.4}
                stroke="var(--color-vaccinations)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Tendance des vaccinations <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Données agrégées par jour
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default VaccinationTrend;