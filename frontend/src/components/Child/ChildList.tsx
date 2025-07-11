import axios from "axios";
import { useEffect, useState, useRef } from "react";
import ChildRow from "./ChildRow";
import ChildDetailsPopup from "./ChildDetailsPopup";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AlertCircle, Loader2, Users, UserPlus, Home, Calendar, Info, Printer } from "lucide-react";
import { format } from "date-fns";
import ChildFilters from "./ChildFilters";

export default function ChildList() {
  const [data, setData] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
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
    rappel_count: null as number | null,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setLoading(true);
    
    // Si aucun vaccin n'est sélectionné, on récupère tous les enfants
    if (!filters.vaccin_id) {
      axios
        .get("http://localhost:3000/api/enfants")
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => setLoading(false));
    } 
    // Si un vaccin est sélectionné, on choisit l'endpoint approprié
    else {
      let url;
      
      // 1. Si on veut les enfants non vaccinés
      if (filters.show_not_vaccinated) {
        url = `http://localhost:3000/api/enfants/not-vaccinated/${filters.vaccin_id}`;
      }
      // 2. Si on veut filtrer par nombre de rappels
      else if (filters.rappel_count !== null) {
        url = `http://localhost:3000/api/enfants/vaccine/${filters.vaccin_id}/rappel/${filters.rappel_count}`;
      }
      // 3. Sinon, on affiche tous les enfants vaccinés avec ce vaccin
      else {
        url = `http://localhost:3000/api/enfants/vaccine/${filters.vaccin_id}`;
      }
        
      axios
        .get(url)
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching children data:", error);
        })
        .finally(() => setLoading(false));
    }
  }, [filters.vaccin_id, filters.show_not_vaccinated, filters.rappel_count]); // On refait l'appel API quand le filtre de vaccin ou le checkbox change

  const handleDetailsClick = (enfant: any) => {
    setSelectedChild(enfant);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedChild(null);
  };

  const calculateAge = (dateString: string) => {
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

  const filteredData = data.filter((enfant: any) => {
    return Object.keys(filters).every((key) => {
      // On ignore le filtre vaccin_id car on l'utilise déjà pour l'appel API
      if (key === "vaccin_id") return true;
      if (filters[key as keyof typeof filters] === "") return true;
      if (key === "age_min" || key === "age_max") {
        const age = calculateAge(enfant.date_naissance);
        if (key === "age_min" && age < Number(filters[key as keyof typeof filters]))
          return false;
        if (key === "age_max" && age > Number(filters[key as keyof typeof filters]))
          return false;
        return true;
      }
      // Si c'est la propriété booléenne show_not_vaccinated, on l'ignore pour le filtrage local
      // car elle est déjà prise en compte dans la requête API
      if (key === 'show_not_vaccinated') return true;
      
      // Pour les autres propriétés (qui sont des chaînes)
      const filterValue = filters[key as keyof typeof filters];
      if (typeof filterValue === 'string') {
        return String(enfant[key])
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      return true;
    });
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  
  // Référence pour le contenu à imprimer
  const printContentRef = useRef<HTMLDivElement>(null);
  
  // Fonction pour obtenir un résumé des filtres actifs
  const getActiveFiltersText = () => {
    const activeFilters: string[] = [];
    
    if (filters.Nom) activeFilters.push(`Nom: ${filters.Nom}`);
    if (filters.Prenom) activeFilters.push(`Prénom: ${filters.Prenom}`);
    if (filters.CODE) activeFilters.push(`CODE: ${filters.CODE}`);
    if (filters.date_naissance) activeFilters.push(`Date de naissance: ${filters.date_naissance}`);
    if (filters.SEXE) activeFilters.push(`Sexe: ${filters.SEXE}`);
    if (filters.NomMere) activeFilters.push(`Nom de la mère: ${filters.NomMere}`);
    if (filters.NomPere) activeFilters.push(`Nom du père: ${filters.NomPere}`);
    if (filters.Domicile) activeFilters.push(`Domicile: ${filters.Domicile}`);
    if (filters.Fokotany) activeFilters.push(`Fokotany: ${filters.Fokotany}`);
    if (filters.Hameau) activeFilters.push(`Hameau: ${filters.Hameau}`);
    if (filters.Telephone) activeFilters.push(`Téléphone: ${filters.Telephone}`);
    if (filters.age_min) activeFilters.push(`Âge minimum: ${filters.age_min} ans`);
    if (filters.age_max) activeFilters.push(`Âge maximum: ${filters.age_max} ans`);
    if (filters.vaccin_id) {
      // On ajoute les infos sur le vaccin sélectionné
      const vaccinInfo = `Vaccin: ID ${filters.vaccin_id}`;
      if (filters.show_not_vaccinated) {
        activeFilters.push(`${vaccinInfo} (Enfants NON vaccinés)`);
      } else if (filters.rappel_count !== null) {
        activeFilters.push(`${vaccinInfo} (${filters.rappel_count} rappels)`);
      } else {
        activeFilters.push(`${vaccinInfo} (Enfants vaccinés)`);
      }
    }
    
    return activeFilters.length > 0 
      ? `Filtres appliqués: ${activeFilters.join(", ")}` 
      : "Aucun filtre appliqué";
  };
  
  // Fonction pour imprimer la liste des enfants
  const handlePrint = () => {
    // Créer une nouvelle fenêtre d'impression
    const printWindow = window.open('', '', 'width=800,height=600');
    
    if (!printWindow) {
      alert("Veuillez autoriser les fenêtres popup pour imprimer.");
      return;
    }
    
    // Date actuelle formatée
    const currentDate = format(new Date(), "dd/MM/yyyy à HH:mm");
    
    // Préparer le contenu HTML à imprimer
    printWindow.document.write(`
      <html>
        <head>
          <title>Liste des enfants - CSB</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid #ddd;
            }
            .filters {
              background-color: #f9f9f9;
              padding: 10px;
              border-radius: 4px;
              margin-bottom: 20px;
              border: 1px solid #eee;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              font-size: 12px;
              text-align: center;
              margin-top: 20px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Liste des enfants</h2>
            <p>CSB - Centre de Santé de Base</p>
            <p>Imprimé le ${currentDate}</p>
          </div>
          
          <div class="filters">
            ${getActiveFiltersText()}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Date de Naissance</th>
                <th>Sexe</th>
                <th>Domicile</th>
                <th>Fokotany</th>
                <th>Hameau</th>
              </tr>
            </thead>
            <tbody>
    `);
    
    // Ajouter toutes les données (pas juste la page courante)
    filteredData.forEach((enfant: any) => {
      printWindow.document.write(`
        <tr>
          <td>${enfant.Nom || ''}</td>
          <td>${enfant.Prenom || ''}</td>
          <td>${enfant.date_naissance ? new Date(enfant.date_naissance).toLocaleDateString() : ''}</td>
          <td>${enfant.SEXE || ''}</td>
          <td>${enfant.Domicile || ''}</td>
          <td>${enfant.Fokotany || ''}</td>
          <td>${enfant.Hameau || ''}</td>
        </tr>
      `);
    });
    
    printWindow.document.write(`
            </tbody>
          </table>
          
          <div class="footer">
            <p>Nombre total d'enfants: ${filteredData.length}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Déclencher l'impression
    setTimeout(() => {
      printWindow.print();
      // printWindow.close();
    }, 500);
  };

  return (
    <div className="p-6 flex flex-col items-center pt-[70px] overflow-y-auto w-full relative transition-all duration-300">
      {loading ? (
        <Card className="flex flex-col items-center justify-center w-full max-w-xl p-6 text-center shadow-lg mx-auto bg-white rounded-lg">
          <CardHeader>
            <Loader2 className="w-12 h-12 text-gray-500 animate-spin mx-auto" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-gray-800 text-lg font-semibold">
              Chargement en cours...
            </CardTitle>
            <p className="text-gray-600 text-sm">Veuillez patienter.</p>
          </CardContent>
        </Card>
      ) : data.length === 0 ? (
        <Card className="flex flex-col items-center justify-center w-full max-w-xl p-6 text-center shadow-lg mx-auto bg-white rounded-lg">
          <CardHeader>
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-gray-800 text-lg font-semibold">
              Aucun enfant trouvé
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Ajoutez un nouvel enfant pour commencer.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center w-full max-w-4xl mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users className="text-primary" size={20} />
              Liste des enfants <span className="text-sm font-normal text-gray-500 ml-2">({filteredData.length} résultats)</span>
            </h2>
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2 text-sm bg-white hover:bg-gray-50 text-primary border border-primary/30 hover:border-primary transition-colors shadow-sm"
            >
              <Printer size={16} />
              Imprimer la liste
            </Button>
          </div>
          
          <div ref={printContentRef}>
            <Card className="overflow-hidden shadow-xl rounded-lg border border-gray-200 w-full max-w-4xl mx-auto bg-white hover:shadow-2xl transition-shadow duration-300">
              <div className="p-2 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="text-xs text-gray-500 px-2">Cliquez sur une ligne pour voir les détails</div>
              </div>
              <div className="overflow-x-auto">
                <Table className="w-full text-base">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-primary/20 to-primary/5 text-gray-800">
                    <TableHead className="font-semibold p-3 text-center">
                      <Users className="inline-block mr-2 w-5 h-5 text-primary" />{" "}
                      Nom
                    </TableHead>
                    <TableHead className="font-semibold p-3 text-center">
                      <UserPlus className="inline-block mr-2 w-5 h-5 text-primary" />{" "}
                      Prénom
                    </TableHead>
                    <TableHead className="font-semibold p-3 text-center">
                      <Calendar className="inline-block mr-2 w-5 h-5 text-primary" />{" "}
                      Date de Naissance
                    </TableHead>
                    <TableHead className="font-semibold p-3 text-center">
                      <Home className="inline-block mr-2 w-5 h-5 text-primary" />{" "}
                      Domicile
                    </TableHead>
                    <TableHead className="font-semibold p-3 text-center">
                      <Info className="inline-block mr-2 w-5 h-5 text-primary" />{" "}
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((enfant: any, index: number) => (
                    <ChildRow
                      key={enfant.id}
                      enfant={enfant}
                      isEven={index % 2 === 0}
                      onDetailsClick={handleDetailsClick}
                    />
                  ))}
                </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6 mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100 max-w-md mx-auto">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Précédent
            </Button>
            <span className="text-gray-800 font-medium px-4 py-1 bg-gray-50 rounded-md border border-gray-100">
              Page <span className="text-primary font-semibold">{currentPage}</span> sur {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              Suivant
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Button>
          </div>
        </>
      )}

      {/* Composant des filtres */}
      <ChildFilters
        filters={filters}
        setFilters={setFilters}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        {selectedChild && (
          <ChildDetailsPopup enfant={selectedChild} onClose={closePopup} />
        )}
      </Dialog>
    </div>
  );
}