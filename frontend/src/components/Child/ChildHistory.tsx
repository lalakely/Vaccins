import { useState, useEffect, useRef } from "react";
import ApiService from "@/utils/apiService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNotification } from "@/contexts/NotificationContext";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Loader2,
  RotateCcw,
  Clock,
  User,
  FileText,
  Plus,
  Edit,
  Trash,
  Printer
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReactToPrint } from "react-to-print";
import ChildPrintView from "./ChildPrintView";

// Interface pour les entrées d'historique
interface HistoryItem {
  id: number;
  child_id: number;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE';
  action_date: string;
  user_id: number | null;
  old_data: string | null;
  new_data: string | null;
  Nom: string | null;
  Prenom: string | null;
  username: string | null;
  history_type: 'regular' | 'deletion';
}

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

// Interface pour les changements détectés
interface Change {
  field: string;
  oldValue: any;
  newValue: any;
}

export default function ChildHistory() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  // Plus de mode de démonstration - utiliser uniquement l'API réelle
  const itemsPerPage = 10;
  
  // États pour l'impression
  const [selectedChildData, setSelectedChildData] = useState<Child | null>(null);
  const [childVaccines, setChildVaccines] = useState<Vaccine[]>([]);
  const [vaccineRappels, setVaccineRappels] = useState<{[key: string]: Rappel[]}>({});
  const [administeredRappels, setAdministeredRappels] = useState<{[key: string]: boolean[]}>({});
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  
  // Référence pour l'impression
  const printRef = useRef<HTMLDivElement>(null);
  
  // Accès au système de notifications
  const { addNotification } = useNotification();

  // Calcul des éléments à afficher sur la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historyData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historyData.length / itemsPerPage);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      
      // Vérifier si l'API est disponible
      try {
        const response = await ApiService.get("/api/history", {
          retries: 2,          // Faire jusqu'à 2 tentatives
          retryDelay: 1000,    // Attendre 1 seconde entre les tentatives
          timeout: 5000,       // Timeout après 5 secondes
          silentError: true    // Ne pas logger les erreurs (on les gère nous-mêmes)
        });
        setHistoryData(response.data);
        // Données de l'API réelles chargées avec succès
        setError(null);
      } catch (apiError: any) {
        // En cas d'erreur, afficher un message d'erreur approprié
        if (apiError.response && apiError.response.status === 404) {
          console.error("Endpoint d'historique non disponible");
          setHistoryData([]);
          setError("L'historique n'est pas disponible pour le moment. Veuillez contacter l'administrateur.");
        } else if (apiError.code === 'ECONNABORTED' || apiError.name === 'AbortError') {
          console.error("Timeout lors de la connexion à l'API d'historique");
          setHistoryData([]);
          setError("La connexion au serveur a pris trop de temps. Veuillez vérifier votre connexion et réessayer.");
        } else {
          throw apiError;
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      setHistoryData([]);
      // Erreur lors de la récupération des données
      
      addNotification({
        id: Date.now(),
        title: "Erreur de chargement",
        message: "Impossible de récupérer l'historique des modifications.",
        type: "error",
        category: "system",
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (historyId: number, historyType: string) => {
    try {
      // Déclencher une reversion en fonction du type d'historique
      let response;
      if (historyType === 'regular') {
        response = await ApiService.post(`/api/history/revert/${historyId}`, {}, {
          retries: 1,          // Faire une seule tentative supplémentaire
          timeout: 10000       // Donner plus de temps pour cette opération
        });
      } else if (historyType === 'deletion') {
        response = await ApiService.post(`/api/deleted-children/restore/${historyId}`, {}, {
          retries: 1,          // Faire une seule tentative supplémentaire
          timeout: 10000       // Donner plus de temps pour cette opération
        });
      } else {
        throw new Error("Type d'historique non reconnu");
      }
      
      addNotification({
        id: Date.now(),
        title: "Succès",
        message: "La modification a été annulée avec succès.",
        type: "success",
        category: "action_feedback",
        isRead: false,
        createdAt: new Date().toISOString()
      });
      
      // Actualiser les données après la réversion
      fetchHistoryData();
      
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de l'annulation de la modification:", error);
      
      addNotification({
        id: Date.now(),
        title: "Erreur",
        message: error.response?.data?.message || "Impossible d'annuler cette modification.",
        type: "error",
        category: "system",
        isRead: false,
        createdAt: new Date().toISOString()
      });
      
      throw error;
    }
  };

  const handleViewDetails = (history: HistoryItem) => {
    setSelectedHistory(history);
    setShowDetails(true);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "CREATE":
        return <Plus className="h-4 w-4" />;
      case "UPDATE":
        return <Edit className="h-4 w-4" />;
      case "DELETE":
        return <Trash className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case "CREATE":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <Plus className="h-3 w-3 mr-1" /> Création
          </Badge>
        );
      case "UPDATE":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Edit className="h-3 w-3 mr-1" /> Modification
          </Badge>
        );
      case "DELETE":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <Trash className="h-3 w-3 mr-1" /> Suppression
          </Badge>
        );
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return "Date inconnue";
    }
  };

  // Fonction pour comparer les données avant/après et identifier les changements
  const getChanges = (oldData: any, newData: any): Change[] => {
    const changes: Change[] = [];
    
    if (!oldData || !newData) {
      return changes;
    }
    
    try {
      const oldObj = typeof oldData === 'string' ? JSON.parse(oldData) : oldData;
      const newObj = typeof newData === 'string' ? JSON.parse(newData) : newData;
      
      // Vérifier les champs modifiés
      const allKeys = [...new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])];
      
      allKeys.forEach(key => {
        const oldValue = oldObj ? oldObj[key] : null;
        const newValue = newObj ? newObj[key] : null;
        
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            field: key,
            oldValue,
            newValue
          });
        }
      });
    } catch (error) {
      console.error("Erreur lors de l'analyse des changements:", error);
    }
    
    return changes;
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Fonction pour imprimer le rapport
  const handlePrint = useReactToPrint({
    documentTitle: "Carnet de santé",
    // @ts-ignore - La propriété content existe bien dans react-to-print mais TypeScript ne la reconnaît pas correctement
    content: () => printRef.current,
    onBeforeGetContent: async () => Promise.resolve(),
    onAfterPrint: () => setShowPrintPreview(false),
    removeAfterPrint: true
  });

  // Fonction pour charger les données de l'enfant
  const fetchChildData = async (childId: number) => {
    setPrintLoading(true);
    try {
      // Récupérer les données de l'enfant
      const childResponse = await ApiService.get(`/api/enfants/${childId}`);
      setSelectedChildData(childResponse.data);
      
      // Récupérer les vaccinations de l'enfant
      const vaccinationsResponse = await ApiService.get(`/api/vaccinations/child?enfant_id=${childId}`);
      setChildVaccines(vaccinationsResponse.data);
      
      // Pour chaque vaccin, récupérer ses rappels
      const rappelsMap: {[key: string]: Rappel[]} = {};
      const administeredMap: {[key: string]: boolean[]} = {};
      
      for (const vaccine of vaccinationsResponse.data) {
        try {
          const rappelsResponse = await ApiService.get(`/api/vaccins/${vaccine.vaccin_id}/rappels`);
          rappelsMap[vaccine.id] = rappelsResponse.data;
          
          // Initialiser les rappels administrés
          administeredMap[vaccine.id] = Array(rappelsResponse.data.length).fill(false);
          
          // Vérifier pour chaque rappel s'il a été administré
          for (let i = 0; i < rappelsResponse.data.length; i++) {
            try {
              const checkResponse = await ApiService.get(
                `/api/vaccinations/check-rappel?enfant_id=${childId}&vaccin_id=${vaccine.vaccin_id}&rappel_id=${i}`
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
      addNotification({
        id: Date.now(),
        title: "Erreur",
        message: "Impossible de récupérer les informations de l'enfant.",
        type: "error",
        category: "system",
        isRead: false,
        createdAt: new Date().toISOString()
      });
    } finally {
      setPrintLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div>
        <CardHeader className="flex justify-between items-center">
           <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800 flex items-center gap-2">
                Historique des modifications
          </h1>
          <div className="w-full border-t border-gray-200 my-6"></div>
          {error && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
              Mode hors ligne
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 mb-4 text-red-500">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
              <p className="mt-2 text-gray-600">Chargement de l'historique...</p>
            </div>
          ) : historyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun historique</h3>
              <p className="mt-1 text-gray-500">
                Aucune modification n'a été enregistrée.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Date</TableHead>
                      <TableHead>Enfant</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((history) => {
                      const childName = `${history.Nom || ""} ${history.Prenom || ""}`.trim() || "Inconnu";
                       
                      return (
                        <TableRow key={history.id}>
                          <TableCell className="font-medium">
                            {formatDate(history.action_date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-between">
                              <span>{childName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getActionBadge(history.action_type)}</TableCell>
                          <TableCell>{history.username || "Système"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(history)}
                              >
                                Détails
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevert(history.id, history.history_type)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" /> Annuler
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </div>

      {/* Modal de détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {selectedHistory && getActionIcon(selectedHistory.action_type)}
              Détails de la modification
            </DialogTitle>
          </DialogHeader>

          {selectedHistory && (
            <ScrollArea className="h-[60vh]">
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Date et heure
                  </h3>
                  <p className="text-gray-600">
                    {formatDate(selectedHistory.action_date)}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" /> Utilisateur
                  </h3>
                  <p className="text-gray-600">
                    {selectedHistory.username || "Système"}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Type d'action</h3>
                  <div>{getActionBadge(selectedHistory.action_type)}</div>
                </div>

                {selectedHistory.action_type === "CREATE" && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Données ajoutées
                    </h3>
                    <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                      {JSON.stringify(
                        selectedHistory.new_data ? JSON.parse(selectedHistory.new_data) : {},
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}

                {selectedHistory.action_type === "DELETE" && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Données supprimées
                    </h3>
                    <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                      {JSON.stringify(
                        selectedHistory.old_data ? JSON.parse(selectedHistory.old_data) : {},
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}

                {selectedHistory.action_type === "UPDATE" && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Changements effectués
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Champ</TableHead>
                          <TableHead>Ancienne valeur</TableHead>
                          <TableHead>Nouvelle valeur</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getChanges(
                          selectedHistory.old_data,
                          selectedHistory.new_data
                        ).map((change, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{change.field}</TableCell>
                            <TableCell>
                              {change.oldValue === null
                                ? "Non défini"
                                : typeof change.oldValue === "object"
                                ? JSON.stringify(change.oldValue)
                                : String(change.oldValue)}
                            </TableCell>
                            <TableCell>
                              {change.newValue === null
                                ? "Non défini"
                                : typeof change.newValue === "object"
                                ? JSON.stringify(change.newValue)
                                : String(change.newValue)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                    className="mr-2"
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={() => {
                      handleRevert(selectedHistory.id, selectedHistory.history_type);
                      setShowDetails(false);
                    }}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" /> Annuler cette modification
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal pour l'aperçu d'impression */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Aperçu d'impression
            </DialogTitle>
          </DialogHeader>
          
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
              onClick={handlePrint} 
              disabled={printLoading || !selectedChildData}
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
