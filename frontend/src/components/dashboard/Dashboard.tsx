"use client";

import * as React from "react";
import KPICard from "../dashboard/KPICard";
import VaccinationRatio from "@/components/dashboard/VaccinationRatio";
import VaccineCoverage from "@/components/dashboard/VaccineCoverage";
import VaccinationTrend from "@/components/dashboard/VaccinationTrend";
import GenderAgeChart from "@/components/dashboard/GenderAgeChart";
import VaccinationPercentage from "@/components/dashboard/VaccinationPercentage";
import MapOverview from "@/components/dashboard/MapOverview"; // Nouvelle carte des fokotany et hameaux
import { Users, Syringe, UserX } from "lucide-react";

function Dashboard() {
  const [kpis, setKpis] = React.useState({
    totalEnfants: 0,
    vaccins: 0,
    nonVaccines: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchKpis = async () => {
      try {
        const enfantsRes = await fetch("http://localhost:3000/api/enfants");
        const vaccinationsRes = await fetch("http://localhost:3000/api/vaccinations");

        if (!enfantsRes.ok || !vaccinationsRes.ok) {
          throw new Error("Erreur lors de la récupération des KPIs");
        }

        const enfants = await enfantsRes.json();
        const vaccinations = await vaccinationsRes.json();

        const enfantsVaccinesIds = new Set(vaccinations.map((vac: any) => vac.enfant_id));
        const enfantsVaccinesCount = enfantsVaccinesIds.size;

        setKpis({
          totalEnfants: enfants.length,
          vaccins: enfantsVaccinesCount,
          nonVaccines: enfants.length - enfantsVaccinesCount,
        });
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des KPIs :", error);
        setLoading(false);
      }
    };

    fetchKpis();
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 w-[100%]">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Tableau de Bord
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Aperçu des statistiques vaccinales
          </p>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
          <KPICard
            title="Total Enfants"
            value={kpis.totalEnfants.toLocaleString()}
            loading={loading}
            icon={<Users className="h-5 w-5" />}
            className="bg-gradient-to-br from-blue-50 to-white"
          />
          <KPICard
            title="Vaccinés"
            value={kpis.vaccins.toLocaleString()}
            loading={loading}
            icon={<Syringe className="h-5 w-5" />}
            className="bg-gradient-to-br from-green-50 to-white"
          />
          <KPICard
            title="Non Vaccinés"
            value={kpis.nonVaccines.toLocaleString()}
            loading={loading}
            icon={<UserX className="h-5 w-5" />}
            className="bg-gradient-to-br from-red-50 to-white"
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carte des Fokotany et Hameaux - En haut sur toute la largeur */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100">
            <MapOverview />
          </div>

          {/* Première ligne : Deux graphiques côte à côte */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <VaccinationPercentage />
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <VaccineCoverage />
          </div>

          {/* Deuxième ligne : Grand graphique VaccinationRatio */}
          <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100">
            <VaccinationRatio />
          </div>

          {/* Autres graphiques */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <VaccinationTrend />
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <GenderAgeChart />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;