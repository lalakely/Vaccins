import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import {
  FaUser,
  FaUserPlus,
  FaBarcode,
  FaCalendarAlt,
  FaVenusMars,
  FaHome,
  FaPhone,
  FaUserTie,
  FaUserFriends,
} from "react-icons/fa";

interface Filters {
  Nom: string;
  Prenom: string;
  CODE: string;
  date_naissance: string;
  SEXE: string;
  NomMere: string;
  NomPere: string;
  Domicile: string;
  Fokotany: string;
  Hameau: string;
  Telephone: string;
  age_min: string;
  age_max: string;
}

interface ChildFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
}

export default function ChildFilters({
  filters,
  setFilters,
  isFilterOpen,
  setIsFilterOpen,
}: ChildFiltersProps) {
  const resetFilters = () => {
    setFilters({
      Nom: "",
      Prenom: "",
      CODE: "",
      date_naissance: "",
      SEXE: "",
      NomMere: "",
      NomPere: "",
      Domicile: "",
      Fokotany: "",
      Hameau: "",
      Telephone: "",
      age_min: "",
      age_max: "",
    });
  };

  return (
    <>
      {/* Bouton d'ouverture des filtres (style cohérent avec le bouton de la sidebar) */}
      <Button
        variant="outline"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className={`fixed top-1/2 right-4 transform -translate-y-1/2 bg-white border border-gray-300 text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-200 transition-all z-50 ${
          isFilterOpen ? "right-[275px]" : "right-[15px]"
        }`}
      >
        <Filter className="w-5 h-5" />
      </Button>

      {/* Tiroir des filtres (style cohérent avec la sidebar) */}
      <div
        className={`fixed top-0 right-0 h-full max-w-[256px] w-full bg-muted p-5 shadow-lg flex flex-col justify-start transform transition-transform duration-300 ease-in-out z-40 ${
          isFilterOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="text-xl font-semibold text-muted-foreground mb-6 flex items-center gap-2">
          <Filter className="w-6 h-6 text-gray-600" /> Filtres
        </h2>

        <div className="flex flex-col gap-3">
          {/* Nom */}
          <div className="flex items-center gap-2">
            <FaUser className="text-gray-600 w-5 h-5" />
            <Input
              type="text"
              placeholder="Nom"
              value={filters.Nom}
              onChange={(e) => setFilters({ ...filters, Nom: e.target.value })}
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Prénom */}
          <div className="flex items-center gap-2">
            <FaUserPlus className="text-gray-600 w-5 h-5" />
            <Input
              type="text"
              placeholder="Prénom"
              value={filters.Prenom}
              onChange={(e) => setFilters({ ...filters, Prenom: e.target.value })}
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* CODE */}
          <div className="flex items-center gap-2">
            <FaBarcode className="text-gray-600 w-5 h-5" />
            <Input
              type="text"
              placeholder="CODE"
              value={filters.CODE}
              onChange={(e) => setFilters({ ...filters, CODE: e.target.value })}
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Date de Naissance */}
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-600 w-5 h-5" />
            <Input
              type="date"
              value={filters.date_naissance}
              onChange={(e) =>
                setFilters({ ...filters, date_naissance: e.target.value })
              }
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Sexe */}
          <div className="flex items-center gap-2">
            <FaVenusMars className="text-gray-600 w-5 h-5" />
            <select
              value={filters.SEXE}
              onChange={(e) => setFilters({ ...filters, SEXE: e.target.value })}
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all w-full p-2"
            >
              <option value="">Sélectionner</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>

          {/* Nom de la Mère */}
          <div className="flex items-center gap-2">
            <FaUserTie className="text-gray-600 w-5 h-5" />
            <Input
              type="text"
              placeholder="Nom de la Mère"
              value={filters.NomMere}
              onChange={(e) =>
                setFilters({ ...filters, NomMere: e.target.value })
              }
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Nom du Père */}
          <div className="flex items-center gap-2">
            <FaUserTie className="text-gray-600 w-5 h-5" />
            <Input
              type="text"
              placeholder="Nom du Père"
              value={filters.NomPere}
              onChange={(e) =>
                setFilters({ ...filters, NomPere: e.target.value })
              }
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Domicile */}
          <div className="flex items-center gap-2">
            <FaHome className="text-gray-600 w-5 h-5" />
            <Input
              type="text"
              placeholder="Domicile"
              value={filters.Domicile}
              onChange={(e) =>
                setFilters({ ...filters, Domicile: e.target.value })
              }
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Fokotany */}
          <div className="flex items-center gap-2">
            <FaHome className="text-gray-600 w-5 h-5" />
            <Input
              type="text"
              placeholder="Fokotany"
              value={filters.Fokotany}
              onChange={(e) =>
                setFilters({ ...filters, Fokotany: e.target.value })
              }
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Hameau */}
          <div className="flex items-center gap-2">
            <FaHome className="text-gray-600 w-5 h-5" />
            <Input
              type="text"
              placeholder="Hameau"
              value={filters.Hameau}
              onChange={(e) =>
                setFilters({ ...filters, Hameau: e.target.value })
              }
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Téléphone */}
          <div className="flex items-center gap-2">
            <FaPhone className="text-gray-600 w-5 h-5" />
            <Input
              type="text"
              placeholder="Téléphone"
              value={filters.Telephone}
              onChange={(e) =>
                setFilters({ ...filters, Telephone: e.target.value })
              }
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Âge Min */}
          <div className="flex items-center gap-2">
            <FaUserFriends className="text-gray-600 w-5 h-5" />
            <Input
              type="number"
              placeholder="Âge Min"
              value={filters.age_min}
              onChange={(e) => {
                const age_min = e.target.value;
                setFilters({
                  ...filters,
                  age_min,
                  age_max: Math.max(filters.age_max || 0, age_min),
                });
              }}
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Âge Max */}
          <div className="flex items-center gap-2">
            <FaUserFriends className="text-gray-600 w-5 h-5" />
            <Input
              type="number"
              placeholder="Âge Max"
              value={filters.age_max}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  age_max: Math.max(e.target.value || 0, filters.age_min || 0),
                })
              }
              className="bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Bouton Réinitialiser (style cohérent avec les boutons de NavBar) */}
          <Button
            variant="outline"
            onClick={resetFilters}
            className="mt-4 bg-white text-gray-600 border border-gray-300 rounded-lg shadow-md hover:bg-gray-100 transition-all"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    </>
  );
}