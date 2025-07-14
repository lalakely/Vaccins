import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export default function ChildHistory() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHistoryData(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'historique:", err);
      setError(
        "Impossible de charger l'historique des modifications. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (historyId: number, historyType: string) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir annuler cette modification ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Utiliser l'API appropriée en fonction du type d'historique
      if (historyType === 'deletion') {
        // Pour les suppressions, utiliser l'API de restauration des enfants supprimés
        await axios.post(
          `http://localhost:3000/api/deleted-children/revert/${historyId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Pour les autres types d'historique, utiliser l'API standard de revert
        await axios.post(
          `http://localhost:3000/api/history/revert/${historyId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      
      // Rafraîchir les données après le revert
      await fetchHistoryData();
      alert("Modification annulée avec succès");
    } catch (err) {
      console.error("Erreur lors de l'annulation de la modification:", err);
      alert(
        "Impossible d'annuler la modification. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (history) => {
    setSelectedHistory(history);
    setShowDetails(true);
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case "CREATE":
        return <Plus className="h-4 w-4" />;
      case "UPDATE":
        return <Edit className="h-4 w-4" />;
      case "DELETE":
        return <Trash className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionBadge = (actionType) => {
    switch (actionType) {
      case "CREATE":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Ajout</Badge>
        );
      case "UPDATE":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Modification</Badge>
        );
      case "DELETE":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">Suppression</Badge>
        );
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy à HH:mm:ss", {
        locale: fr,
      });
    } catch (e) {
      return dateString;
    }
  };

  // Pagination
  const totalPages = Math.ceil(historyData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historyData.slice(indexOfFirstItem, indexOfLastItem);

  // Fonction pour comparer les données avant/après et identifier les changements
  const getChanges = (oldData, newData) => {
    if (!oldData || !newData) return [];
    
    const changes = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    
    allKeys.forEach(key => {
      // Ignorer les champs techniques ou non pertinents
      if (key === 'id' || key === 'created_at' || key === 'updated_at') return;
      
      const oldValue = oldData[key];
      const newValue = newData[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue: oldValue !== undefined ? oldValue : 'Non défini',
          newValue: newValue !== undefined ? newValue : 'Non défini'
        });
      }
    });
    
    return changes;
  };

  return (
    <div className="p-6 flex flex-col items-center pt-[70px] overflow-y-auto w-full relative transition-all duration-300 ">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800 flex items-center gap-2">
        <Clock className="text-gray-600" /> Historique des modifications
      </h1>

      {loading ? (
        <Card className="flex flex-col items-center justify-center w-full max-w-4xl p-6 text-center shadow-lg mx-auto bg-white rounded-lg">
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
      ) : error ? (
        <Card className="flex flex-col items-center justify-center w-full max-w-4xl p-6 text-center shadow-lg mx-auto bg-white rounded-lg">
          <CardHeader>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-gray-800 text-lg font-semibold">
              Erreur
            </CardTitle>
            <p className="text-gray-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      ) : historyData.length === 0 ? (
        <Card className="flex flex-col items-center justify-center w-full max-w-4xl p-6 text-center shadow-lg mx-auto bg-white rounded-lg">
          <CardHeader>
            <FileText className="w-12 h-12 text-gray-500 mx-auto" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-gray-800 text-lg font-semibold">
              Aucun historique disponible
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Aucune modification n'a été enregistrée.
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
                    Date
                  </TableHead>
                  <TableHead className="font-semibold p-3 text-center">
                    Enfant
                  </TableHead>
                  <TableHead className="font-semibold p-3 text-center">
                    Action
                  </TableHead>
                  <TableHead className="font-semibold p-3 text-center">
                    Utilisateur
                  </TableHead>
                  <TableHead className="font-semibold p-3 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((history) => {
                  const oldData = history.old_data ? JSON.parse(history.old_data) : null;
                  const newData = history.new_data ? JSON.parse(history.new_data) : null;
                  const childName = history.Nom && history.Prenom 
                    ? `${history.Nom} ${history.Prenom}` 
                    : (oldData ? `${oldData.Nom} ${oldData.Prenom}` : 
                       (newData ? `${newData.Nom} ${newData.Prenom}` : 'Inconnu'));
                  
                  return (
                    <TableRow
                      key={history.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="p-3 text-center">
                        {formatDate(history.action_date)}
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        {childName}
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        {getActionBadge(history.action_type)}
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        {history.username || "Système"}
                      </TableCell>
                      <TableCell className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(history)}
                            className="text-gray-700 border-gray-300 hover:bg-gray-100"
                          >
                            Détails
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevert(history.id, history.history_type)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            title={"Annuler cette modification"}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" /> Annuler
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
              Page {currentPage} sur {totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Suivant
            </Button>
          </div>
        </>
      )}

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
                      {JSON.stringify(JSON.parse(selectedHistory.new_data || "{}"), null, 2)}
                    </pre>
                  </div>
                )}

                {selectedHistory.action_type === "DELETE" && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Données supprimées
                    </h3>
                    <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                      {JSON.stringify(JSON.parse(selectedHistory.old_data || "{}"), null, 2)}
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
                          JSON.parse(selectedHistory.old_data || "{}"),
                          JSON.parse(selectedHistory.new_data || "{}")
                        ).map((change, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{change.field}</TableCell>
                            <TableCell>{String(change.oldValue)}</TableCell>
                            <TableCell>{String(change.newValue)}</TableCell>
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
    </div>
  );
}
