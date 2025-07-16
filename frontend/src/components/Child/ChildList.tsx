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
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Printer, Download } from "lucide-react";
import ChildFilters from "./ChildFilters";
import { useReactToPrint } from "react-to-print";
import ChildPrintView from "./ChildPrintView";
import ListPrintView from "./ListPrintView";
import { ScrollArea } from "@/components/ui/scroll-area";
import html2pdf from "html2pdf.js";

// Interface pour les vaccins
interface Vaccine {
  id: string;
  vaccin_id: string;
  Nom: string;
  name: string;
  date_vaccination: string;
}

// Interface pour les rappels
interface Rappel {
  delai: number;
  description: string;
  id?: string;
  vaccin_id?: string;
}

// Interface pour l'enfant
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

export default function ChildList() {
  const [data, setData] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États pour l'impression d'un enfant individuel
  const [selectedChildData, setSelectedChildData] = useState<Child | null>(null);
  const [childVaccines, setChildVaccines] = useState<Vaccine[]>([]);
  const [vaccineRappels, setVaccineRappels] = useState<{[key: string]: Rappel[]}>({});
  const [administeredRappels, setAdministeredRappels] = useState<{[key: string]: boolean[]}>({});
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  
  // États pour l'impression de la liste entière
  const [showListPrintPreview, setShowListPrintPreview] = useState(false);
  const [listPrintLoading, setListPrintLoading] = useState(false);
  
  // Références pour l'impression
  const printRef = useRef<HTMLDivElement>(null);
  const listPrintRef = useRef<HTMLDivElement>(null);

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
  }, [filters]);

  // Calcul des enfants à afficher pour la pagination
  const filteredData = data.filter((enfant) => {
    // Filtrer par nom
    if (
      filters.Nom &&
      !enfant.Nom?.toLowerCase().includes(filters.Nom.toLowerCase())
    ) {
      return false;
    }
    // Filtrer par prénom
    if (
      filters.Prenom &&
      !enfant.Prenom?.toLowerCase().includes(filters.Prenom.toLowerCase())
    ) {
      return false;
    }
    // Filtrer par code
    if (
      filters.CODE &&
      !enfant.CODE?.toLowerCase().includes(filters.CODE.toLowerCase())
    ) {
      return false;
    }
    // Filtrer par sexe
    if (filters.SEXE && enfant.SEXE !== filters.SEXE) {
      return false;
    }
    // Filtrer par nom de la mère
    if (
      filters.NomMere &&
      !enfant.NomMere?.toLowerCase().includes(filters.NomMere.toLowerCase())
    ) {
      return false;
    }
    // Filtrer par nom du père
    if (
      filters.NomPere &&
      !enfant.NomPere?.toLowerCase().includes(filters.NomPere.toLowerCase())
    ) {
      return false;
    }
    // Filtrer par domicile
    if (
      filters.Domicile &&
      !enfant.Domicile?.toLowerCase().includes(filters.Domicile.toLowerCase())
    ) {
      return false;
    }
    // Filtrer par Fokotany
    if (
      filters.Fokotany &&
      !enfant.Fokotany?.toLowerCase().includes(filters.Fokotany.toLowerCase())
    ) {
      return false;
    }
    // Filtrer par Hameau
    if (
      filters.Hameau &&
      !enfant.Hameau?.toLowerCase().includes(filters.Hameau.toLowerCase())
    ) {
      return false;
    }
    // Filtrer par téléphone
    if (
      filters.Telephone &&
      !enfant.Telephone?.includes(filters.Telephone)
    ) {
      return false;
    }

    // Filtrer par âge minimum
    if (filters.age_min) {
      const age = calculateAge(enfant.date_naissance);
      if (age < parseInt(filters.age_min)) {
        return false;
      }
    }

    // Filtrer par âge maximum
    if (filters.age_max) {
      const age = calculateAge(enfant.date_naissance);
      if (age > parseInt(filters.age_max)) {
        return false;
      }
    }

    return true;
  });

  // Gestion de la pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Gestion des clics pour afficher les détails
  const handleDetailsClick = (enfant: any) => {
    setSelectedChild(enfant);
    setShowPopup(true);
  };

  // Fermeture de la popup
  const closePopup = () => {
    setShowPopup(false);
  };

  // Fonction pour imprimer le carnet de santé d'un enfant
  const handlePrint = useReactToPrint({
    documentTitle: "Carnet de santé",
    // @ts-ignore - La propriété content existe bien dans react-to-print mais TypeScript ne la reconnaît pas correctement
    content: () => printRef.current,
    onBeforeGetContent: async () => Promise.resolve(),
    onAfterPrint: () => setShowPrintPreview(false),
    removeAfterPrint: true
  });
  
  // Fonction pour imprimer la liste des personnes
  const handleListPrint = useReactToPrint({
    documentTitle: "Liste des personnes",
    // @ts-ignore
    content: () => listPrintRef.current,
    onBeforeGetContent: async () => Promise.resolve(),
    onAfterPrint: () => setShowListPrintPreview(false),
    removeAfterPrint: true
  });
  
  // Fonction pour générer et télécharger le PDF d'un enfant
  const handleDownloadPDF = () => {
    if (!printRef.current) return;
    
    const element = printRef.current;
    const filename = selectedChildData ? 
      `carnet-sante-${selectedChildData.Nom?.replace(/\s/g, '-').toLowerCase() || ''}-${selectedChildData.Prenom?.replace(/\s/g, '-').toLowerCase() || ''}.pdf` : 
      'carnet-sante.pdf';
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
    };
    
    // Afficher un message de chargement
    setPrintLoading(true);
    
    // Utiliser setTimeout pour permettre à l'UI de se mettre à jour avant de lancer le processus de génération du PDF
    setTimeout(() => {
      html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          setPrintLoading(false);
        })
        .catch((error) => {
          console.error('Erreur lors de la génération du PDF:', error);
          setPrintLoading(false);
        });
    }, 100);
  };
  
  // Fonction pour générer et télécharger le PDF de la liste
  const handleListDownloadPDF = () => {
    if (!listPrintRef.current) return;
    
    const element = listPrintRef.current;
    const activeFilters = [];
    if (filters.Nom) activeFilters.push(filters.Nom);
    if (filters.Prenom) activeFilters.push(filters.Prenom);
    if (filters.Fokotany) activeFilters.push(filters.Fokotany);
    if (filters.Hameau) activeFilters.push(filters.Hameau);
    
    let filename = 'liste-personnes';
    if (activeFilters.length) {
      filename += '-' + activeFilters.join('-').toLowerCase().replace(/\s/g, '-');
    }
    filename += '.pdf';
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as 'landscape' }
    };
    
    // Afficher un message de chargement
    setListPrintLoading(true);
    
    setTimeout(() => {
      html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          setListPrintLoading(false);
        })
        .catch((error) => {
          console.error('Erreur lors de la génération du PDF de la liste:', error);
          setListPrintLoading(false);
        });
    }, 100);
  };

  // Fonction pour charger les données de l'enfant pour l'impression
  const fetchChildData = async (childId: string | number) => {
    setPrintLoading(true);
    try {
      // Récupérer les données de l'enfant
      const childResponse = await axios.get(`http://localhost:3000/api/enfants/${childId}`);
      setSelectedChildData(childResponse.data);
      
      // Récupérer les vaccinations de l'enfant
      const vaccinationsResponse = await axios.get(`http://localhost:3000/api/vaccinations/child?enfant_id=${childId}`);
      setChildVaccines(vaccinationsResponse.data);
      
      // Pour chaque vaccin, récupérer ses rappels
      const rappelsMap: {[key: string]: Rappel[]} = {};
      const administeredMap: {[key: string]: boolean[]} = {};
      
      for (const vaccine of vaccinationsResponse.data) {
        try {
          const rappelsResponse = await axios.get(`http://localhost:3000/api/vaccins/${vaccine.vaccin_id}/rappels`);
          rappelsMap[vaccine.id] = rappelsResponse.data;
          
          // Initialiser les rappels administrés
          administeredMap[vaccine.id] = Array(rappelsResponse.data.length).fill(false);
          
          // Vérifier pour chaque rappel s'il a été administré
          for (let i = 0; i < rappelsResponse.data.length; i++) {
            try {
              const checkResponse = await axios.get(
                `http://localhost:3000/api/vaccinations/check-rappel?enfant_id=${childId}&vaccin_id=${vaccine.vaccin_id}&rappel_id=${i}`
              );
              if (checkResponse.data) {
                administeredMap[vaccine.id][i] = checkResponse.data.administered;
              }
            } catch (err) {
              console.error(`Erreur lors de la vérification du rappel:`, err);
            }
          }
        } catch (err) {
          console.error(`Erreur lors du chargement des rappels:`, err);
        }
      }
      
      setVaccineRappels(rappelsMap);
      setAdministeredRappels(administeredMap);
      setShowPrintPreview(true);
      
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setPrintLoading(false);
    }
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

  // Fonction pour obtenir un résumé des filtres actifs
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

    return activeFilters.length ? activeFilters.join(", ") : "Aucun filtre actif";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* En-tête avec titre et bouton de filtre */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Liste des personnes</h2>
          <p className="text-gray-500 text-sm">
            {filteredData.length} personnes trouvées • {getActiveFiltersText()}
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              onClick={() => setShowListPrintPreview(true)}
            >
              <Printer className="h-4 w-4 mr-1" /> Imprimer la liste
            </Button>
            <Button
              className="mt-3 md:mt-0 bg-white text-gray-800 border hover:bg-gray-50"
              onClick={() => setIsFilterOpen(true)}
            >
              Filtrer la liste
            </Button>
          </div>
        </div>
      </div>

      {/* Liste des enfants */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            <div className="overflow-auto">
              <CardContent className="p-0">
                <div className="overflow-hidden border rounded-lg">
                  <Table className="w-full max-w-[95%] mx-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[22%] py-3 px-4">Nom</TableHead>
                        <TableHead className="w-[18%] py-3 px-4">Prénom</TableHead>
                        <TableHead className="w-[20%] py-3 px-4">Date de naissance</TableHead>
                        <TableHead className="w-[30%] py-3 px-4">Adresse</TableHead>
                        <TableHead className="w-[10%] py-3 px-4 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((enfant: any, index: number) => (
                        <ChildRow
                          key={enfant.id}
                          enfant={enfant}
                          isEven={index % 2 === 0}
                          onDetailsClick={handleDetailsClick}
                          onPrintClick={fetchChildData}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6 mb-4 bg-white p-3 rounded-lg max-w-md mx-auto">
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

      {/* Utilisation du composant ChildDetailsPopup directement car il a sa propre modale */}
      {showPopup && selectedChild && (
        <ChildDetailsPopup enfant={selectedChild} onClose={closePopup} />
      )}

      {/* Modal pour l'aperçu d'impression d'une personne */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="flex flex-col p-3 py-4 space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Aperçu d'impression - Carnet de santé
            </h3>
          </div>
          
          <ScrollArea className="max-h-[70vh] overflow-auto border-t border-b border-gray-200">
            {printLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                <p className="mt-2 text-gray-600">Chargement des données...</p>
              </div>
            ) : (
              selectedChildData && (
                <ChildPrintView 
                  enfant={selectedChildData}
                  vaccines={childVaccines}
                  vaccineRappels={vaccineRappels}
                  administeredRappels={administeredRappels}
                  printRef={printRef}
                />
              )
            )}
          </ScrollArea>
          
          <div className="flex justify-end gap-2 p-4">
            <Button variant="outline" onClick={() => setShowPrintPreview(false)}>
              Fermer
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={printLoading || !selectedChildData}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <Download className="h-4 w-4 mr-1" /> Télécharger PDF
            </Button>
            <Button 
              onClick={handlePrint} 
              disabled={printLoading || !selectedChildData}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <Printer className="h-4 w-4 mr-1" /> Imprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal pour l'aperçu d'impression de la liste filtrée */}
      <Dialog open={showListPrintPreview} onOpenChange={setShowListPrintPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <div className="flex flex-col p-3 py-4 space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Aperçu d'impression - Liste des personnes
            </h3>
            <p className="text-sm text-gray-500">
              {filteredData.length} personnes trouvées • {getActiveFiltersText()}
            </p>
          </div>
          
          <ScrollArea className="max-h-[70vh] overflow-auto border-t border-b border-gray-200">
            {listPrintLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
                <p className="mt-2 text-gray-600">Préparation de la liste...</p>
              </div>
            ) : (
              <ListPrintView 
                children={filteredData} 
                filters={filters} 
                printRef={listPrintRef} 
              />
            )}
          </ScrollArea>
          
          <div className="flex justify-end gap-2 p-4">
            <Button variant="outline" onClick={() => setShowListPrintPreview(false)}>
              Fermer
            </Button>
            <Button 
              onClick={handleListDownloadPDF} 
              disabled={listPrintLoading || filteredData.length === 0}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <Download className="h-4 w-4 mr-1" /> Télécharger PDF
            </Button>
            <Button 
              onClick={handleListPrint} 
              disabled={listPrintLoading || filteredData.length === 0}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <Printer className="h-4 w-4 mr-1" /> Imprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
