import React from "react";
import { Badge } from "@/components/ui/badge";

interface Child {
  ID?: string;
  Nom: string;
  Prenom: string;
  CODE?: string;
  date_naissance: string;
  SEXE: string;
  NomMere?: string;
  NomPere?: string;
  Domicile?: string;
  Fokotany?: string;
  Hameau?: string;
  Telephone?: string;
}

interface ListPrintViewProps {
  children: Child[];
  filters: {
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
  };
  printRef: React.RefObject<HTMLDivElement>;
}

const ListPrintView: React.FC<ListPrintViewProps> = ({ children, filters, printRef }) => {
  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fonction pour calculer l'âge
  const calculateAge = (dateString: string): number => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    
    return age;
  };

  // Obtenir un résumé des filtres actifs pour l'impression
  const getActiveFiltersText = () => {
    const activeFilters = [];

    if (filters.Nom) activeFilters.push(`Nom: ${filters.Nom}`);
    if (filters.Prenom) activeFilters.push(`Prénom: ${filters.Prenom}`);
    if (filters.CODE) activeFilters.push(`Code: ${filters.CODE}`);
    if (filters.SEXE) activeFilters.push(`Sexe: ${filters.SEXE === "M" ? "Garçon" : "Fille"}`);
    if (filters.NomMere) activeFilters.push(`Nom mère: ${filters.NomMere}`);
    if (filters.NomPere) activeFilters.push(`Nom père: ${filters.NomPere}`);
    if (filters.Domicile) activeFilters.push(`Domicile: ${filters.Domicile}`);
    if (filters.Fokotany) activeFilters.push(`Fokotany: ${filters.Fokotany}`);
    if (filters.Hameau) activeFilters.push(`Hameau: ${filters.Hameau}`);
    if (filters.Telephone) activeFilters.push(`Téléphone: ${filters.Telephone}`);
    if (filters.age_min) activeFilters.push(`Âge min: ${filters.age_min} ans`);
    if (filters.age_max) activeFilters.push(`Âge max: ${filters.age_max} ans`);
    if (filters.vaccin_id) activeFilters.push(`Vaccin filtré`);
    if (filters.show_not_vaccinated) activeFilters.push(`Non vaccinés`);
    if (filters.rappel_count !== null) activeFilters.push(`Rappel n° ${filters.rappel_count}`);

    return activeFilters.length ? activeFilters.join(", ") : "Aucun filtre actif";
  };

  return (
    <div ref={printRef} className="p-6 bg-white min-h-screen">
      {/* En-tête */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Liste des personnes</h1>
        <p className="text-sm text-gray-600 mb-1">
          Date d'impression: {new Date().toLocaleDateString("fr-FR", { dateStyle: "long" })}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Total: {children.length} personnes trouvées
        </p>
        
        {/* Affichage des filtres actifs */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <span className="text-sm font-medium">Filtres appliqués:</span>
          {getActiveFiltersText() !== "Aucun filtre actif" ? (
            getActiveFiltersText().split(", ").map((filter, index) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {filter}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="bg-gray-100">
              Aucun filtre
            </Badge>
          )}
        </div>
      </div>
      
      {/* Tableau des personnes */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border p-2 text-left">Nom</th>
            <th className="border p-2 text-left">Prénom</th>
            <th className="border p-2 text-left">Date de naissance</th>
            <th className="border p-2 text-left">Âge</th>
            <th className="border p-2 text-left">Sexe</th>
            <th className="border p-2 text-left">Parents</th>
            <th className="border p-2 text-left">Adresse</th>
          </tr>
        </thead>
        <tbody>
          {children.map((child, index) => (
            <tr key={child.ID || index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
              <td className="border p-2">{child.Nom || "-"}</td>
              <td className="border p-2">{child.Prenom || "-"}</td>
              <td className="border p-2">{formatDate(child.date_naissance) || "-"}</td>
              <td className="border p-2">{calculateAge(child.date_naissance)}</td>
              <td className="border p-2">{child.SEXE === "M" ? "Garçon" : "Fille"}</td>
              <td className="border p-2">
                {child.NomMere && <div>Mère: {child.NomMere}</div>}
                {child.NomPere && <div>Père: {child.NomPere}</div>}
                {!child.NomMere && !child.NomPere && "-"}
              </td>
              <td className="border p-2">
                {child.Domicile && <div>{child.Domicile}</div>}
                {child.Fokotany && <div>Fokotany: {child.Fokotany}</div>}
                {child.Hameau && <div>Hameau: {child.Hameau}</div>}
                {!child.Domicile && !child.Fokotany && !child.Hameau && "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pied de page */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>CSB Vaccins - Carnet de santé électronique</p>
      </div>
    </div>
  );
};

export default ListPrintView;
