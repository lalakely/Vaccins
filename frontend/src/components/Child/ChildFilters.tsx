import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import axios from "axios";
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
  FaSyringe,
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
  vaccin_id: string;
  show_not_vaccinated: boolean;
  rappel_count: number | null;
}

interface ChildFiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
}

interface Vaccin {
  id: number;
  Nom: string;
}

export default function ChildFilters({
  filters,
  setFilters,
  isFilterOpen,
  setIsFilterOpen,
}: ChildFiltersProps) {
  const [vaccins, setVaccins] = useState<Vaccin[]>([]);
  // Nombre fixe de rappels à afficher
  const maxRappels = 3;
  
  useEffect(() => {
    // Récupérer la liste des vaccins lors du chargement du composant
    axios
      .get("http://localhost:3000/api/vaccins")
      .then((response) => {
        setVaccins(response.data);
      })
      .catch((error) => {
        console.error("Error fetching vaccines:", error);
      });
  }, []);

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
      vaccin_id: "",
      show_not_vaccinated: false,
      rappel_count: null,
    });
  };

  return (
    <>
      {/* Bouton d'ouverture des filtres (style cohérent avec le bouton de la sidebar) */}
      <Button
        variant="outline"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className={`fixed top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-all z-50 ${
          isFilterOpen ? "right-[360px]" : "right-[15px]"
        }`}
      >
        <Filter className="w-5 h-5" />
      </Button>

      {/* Tiroir des filtres (style cohérent avec la sidebar) */}
      <div
        className={`${isFilterOpen ? "w-[350px]" : "w-0"} 
          h-full bg-white transform transition-all duration-300 fixed top-0 right-0 z-30 pt-14
          border-l border-gray-200 flex flex-col`}
      >
        <div className="p-4 bg-white border-b sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
            <Filter className="w-6 h-6 text-primary" /> Filtres
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex flex-col gap-4">
            {/* Nom */}
            <div className="flex items-center gap-2">
              <FaUser className="text-gray-600 w-5 h-5" />
              <Input
                type="text"
                placeholder="Nom"
                value={filters.Nom}
                onChange={(e) => setFilters({ ...filters, Nom: e.target.value })}
                className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
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
                className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
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
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
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
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
            </div>

          {/* Sexe */}
          <div className="flex items-center gap-2">
            <FaVenusMars className="text-gray-600 w-5 h-5" />
            <select
              value={filters.SEXE}
              onChange={(e) => setFilters({ ...filters, SEXE: e.target.value })}
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all w-full p-2"
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
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
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
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
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
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
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
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
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
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
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
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
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
                const age_min = parseInt(e.target.value) || 0;
                setFilters({
                  ...filters,
                  age_min: age_min.toString(),
                  age_max: Math.max(parseInt(filters.age_max) || 0, age_min).toString(),
                });
              }}
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
            </div>

          {/* Âge Max */}
          <div className="flex items-center gap-2">
            <FaUserFriends className="text-gray-600 w-5 h-5" />
            <Input
              type="number"
              placeholder="Âge Max"
              value={filters.age_max}
              onChange={(e) => {
                const age_max = parseInt(e.target.value) || 0;
                const age_min = parseInt(filters.age_min) || 0;
                setFilters({
                  ...filters,
                  age_max: Math.max(age_max, age_min).toString(),
                });
              }}
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all"
            />
            </div>

          {/* Filtre par Vaccin */}
          <div className="flex items-center gap-2">
            <FaSyringe className="text-gray-600 w-5 h-5" />
            <select
              value={filters.vaccin_id}
              onChange={(e) => setFilters({ ...filters, vaccin_id: e.target.value, show_not_vaccinated: false })}
              className="bg-white text-gray-600 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-primary transition-all w-full p-2"
            >
              <option value="">Sélectionner un vaccin</option>
              {vaccins.map((vaccin) => (
                <option key={vaccin.id} value={vaccin.id}>
                  {vaccin.Nom}
                </option>
              ))}
            </select>
            </div>

          {/* Option pour afficher les non-vaccinés */}
          {filters.vaccin_id && (
            <div className="flex flex-col gap-2 mt-2 border-t pt-2">
              {/* Case à cocher pour les enfants non vaccinés */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show_not_vaccinated"
                  checked={filters.show_not_vaccinated}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Si on coche cette option, on désactive les filtres de rappel
                      setFilters({ ...filters, show_not_vaccinated: true, rappel_count: null });
                    } else {
                      setFilters({ ...filters, show_not_vaccinated: false });
                    }
                  }}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-offset-0 focus:ring-primary"
                />
                <label htmlFor="show_not_vaccinated" className="text-gray-600 cursor-pointer select-none">
                  Afficher les enfants non vaccinés
                </label>
                </div>
              
              {/* Filtres pour les rappels (uniquement disponibles si les non-vaccinés n'est pas coché) */}
              {!filters.show_not_vaccinated && (
                <div className="mt-2 border-t pt-2">
                  <p className="text-sm font-medium text-gray-600 mb-2">Filtrer par nombre de rappels :</p>
                  <div className="flex flex-col gap-1">
                    {[...Array(maxRappels + 1)].map((_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={`rappel_${index}`}
                          name="rappel_count"
                          checked={filters.rappel_count === index}
                          onChange={() => setFilters({ ...filters, rappel_count: index })}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-primary"
                        />
                        <label htmlFor={`rappel_${index}`} className="text-gray-600 cursor-pointer select-none">
                          {index === 0 ? 'Dose initiale' : `${index} rappel${index > 1 ? 's' : ''}`}
                        </label>
                      </div>
                    ))}
                    <div key="all" className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="rappel_all"
                        name="rappel_count"
                        checked={filters.rappel_count === null}
                        onChange={() => setFilters({ ...filters, rappel_count: null })}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-primary"
                      />
                      <label htmlFor="rappel_all" className="text-gray-600 cursor-pointer select-none">
                        Tous les enfants vaccinés
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bouton Réinitialiser (style cohérent avec les boutons de NavBar) */}
          <Button
            variant="outline"
            onClick={resetFilters}
            className="mt-4 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
          >
            Réinitialiser les filtres
          </Button>
          </div>
        </div>
      </div>
    </>
  );
}