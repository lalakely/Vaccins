import axios from "axios";
import { useEffect, useState } from "react";
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
import { AlertCircle, Loader2, Users, UserPlus, Home, Calendar, Info } from "lucide-react";
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
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/enfants")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => setLoading(false));
  }, []);

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
      if (filters[key as keyof typeof filters] === "") return true;
      if (key === "age_min" || key === "age_max") {
        const age = calculateAge(enfant.date_naissance);
        if (key === "age_min" && age < Number(filters[key as keyof typeof filters]))
          return false;
        if (key === "age_max" && age > Number(filters[key as keyof typeof filters]))
          return false;
        return true;
      }
      return String(enfant[key])
        .toLowerCase()
        .includes(filters[key as keyof typeof filters].toLowerCase());
    });
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

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
          <Card className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 w-full max-w-4xl mx-auto bg-white">
            <Table className="w-full text-base">
              <TableHeader>
                <TableRow className="bg-gray-50 text-gray-800">
                  <TableHead className="font-semibold p-3 text-center">
                    <Users className="inline-block mr-2 w-5 h-5 text-gray-600" />{" "}
                    Nom
                  </TableHead>
                  <TableHead className="font-semibold p-3 text-center">
                    <UserPlus className="inline-block mr-2 w-5 h-5 text-gray-600" />{" "}
                    Prénom
                  </TableHead>
                  <TableHead className="font-semibold p-3 text-center">
                    <Calendar className="inline-block mr-2 w-5 h-5 text-gray-600" />{" "}
                    Date de Naissance
                  </TableHead>
                  <TableHead className="font-semibold p-3 text-center">
                    <Home className="inline-block mr-2 w-5 h-5 text-gray-600" />{" "}
                    Domicile
                  </TableHead>
                  <TableHead className="font-semibold p-3 text-center">
                    <Info className="inline-block mr-2 w-5 h-5 text-gray-600" />{" "}
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
          </Card>

          {/* Pagination */}
          <div className="flex items-center gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Précédent
            </Button>
            <span className="text-gray-800 font-semibold">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Suivant
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