import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";

// Interfaces
interface Vaccine {
  id: string;
  vaccin_id: string;
  Nom: string;
  name: string;
  date_vaccination: string;
}

interface Rappel {
  delai: number;
  description: string;
  id?: string;
  vaccin_id?: string;
  administered?: boolean;
}

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

interface ChildPrintViewProps {
  enfant: Child;
  vaccines: Vaccine[];
  administeredRappels?: {[key: string]: boolean[]};
  vaccineRappels?: {[key: string]: Rappel[]};
  printRef: React.RefObject<HTMLDivElement>;
}

const ChildPrintView: React.FC<ChildPrintViewProps> = ({
  enfant,
  vaccines,
  administeredRappels = {},
  vaccineRappels = {},
  printRef
}) => {
  // Calculer l'âge de l'enfant
  const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMMM yyyy", { locale: fr });
    } catch (error) {
      return "Date inconnue";
    }
  };

  // Regrouper les vaccins par type
  const groupVaccinesByType = (vaccines: Vaccine[]) => {
    const groupedVaccines: { [key: string]: Vaccine[] } = {};
    
    vaccines.forEach(vaccine => {
      if (!groupedVaccines[vaccine.vaccin_id]) {
        groupedVaccines[vaccine.vaccin_id] = [vaccine];
      } else {
        groupedVaccines[vaccine.vaccin_id].push(vaccine);
      }
    });
    
    return groupedVaccines;
  };

  // Vaccins groupés par type
  const groupedVaccines = groupVaccinesByType(vaccines);

  return (
    <div ref={printRef} className="p-8 bg-white print:p-4 print:text-black print:bg-white">
      <div className="text-center mb-8 print:mb-4">
        <h1 className="text-2xl font-bold mb-1 print:text-xl">CARNET DE SANTÉ</h1>
        <h2 className="text-xl font-semibold print:text-lg">Centre de Santé de Base (CSB)</h2>
      </div>

      {/* Informations de l'enfant */}
      <div className="mb-8 print:mb-6">
        <h3 className="text-lg font-bold border-b border-gray-300 mb-4 pb-2 print:text-base">Informations personnelles</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Nom :</strong> {enfant.Nom}</p>
            <p><strong>Prénom :</strong> {enfant.Prenom}</p>
            <p><strong>Date de naissance :</strong> {formatDate(enfant.date_naissance)}</p>
            <p><strong>Âge :</strong> {calculateAge(enfant.date_naissance)} ans</p>
            <p><strong>Sexe :</strong> {enfant.SEXE === "M" ? "Masculin" : "Féminin"}</p>
            {enfant.CODE && <p><strong>Code :</strong> {enfant.CODE}</p>}
          </div>
          <div>
            {enfant.NomMere && <p><strong>Nom de la mère :</strong> {enfant.NomMere}</p>}
            {enfant.NomPere && <p><strong>Nom du père :</strong> {enfant.NomPere}</p>}
            {enfant.Domicile && <p><strong>Domicile :</strong> {enfant.Domicile}</p>}
            {enfant.Fokotany && <p><strong>Fokotany :</strong> {enfant.Fokotany}</p>}
            {enfant.Hameau && <p><strong>Hameau :</strong> {enfant.Hameau}</p>}
            {enfant.Telephone && <p><strong>Téléphone :</strong> {enfant.Telephone}</p>}
          </div>
        </div>
      </div>

      {/* Vaccins administrés */}
      <div className="mb-8 print:mb-6">
        <h3 className="text-lg font-bold border-b border-gray-300 mb-4 pb-2 print:text-base">Vaccins administrés</h3>
        {Object.keys(groupedVaccines).length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaccin</TableHead>
                <TableHead>Date d'administration</TableHead>
                <TableHead>Rappels</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedVaccines).map(([vaccin_id, vaccinesOfType]) => {
                const vaccine = vaccinesOfType[0];
                const rappels = vaccineRappels[vaccine.id] || [];
                
                return (
                  <TableRow key={vaccin_id}>
                    <TableCell className="font-medium">
                      {vaccine.Nom || vaccine.name}
                    </TableCell>
                    <TableCell>
                      {formatDate(vaccine.date_vaccination)}
                    </TableCell>
                    <TableCell>
                      {rappels.length > 0 ? (
                        <div className="space-y-1">
                          {rappels.map((rappel, index) => {
                            // LOGIQUE BASÉE SUR L'ORDRE DES RAPPELS
                            // Un rappel est administré si son index est inférieur au nombre de rappels administrés
                            
                            // Initialiser à false
                            let isAdministered = false;
                            
                            // Priorité 1: Utiliser la propriété administré directement sur l'objet rappel
                            // Cette propriété est définie par ChildVaccinations.tsx et reflète l'ordre des rappels
                            if (rappel.administered !== undefined) {
                              isAdministered = rappel.administered;
                              console.log(`Rappel ${index+1} utilisant rappel.administered: ${isAdministered}`);
                            } 
                            // Priorité 2: Vérifier dans administeredRappels avec vaccin_id
                            else if (administeredRappels[vaccine.vaccin_id]?.[index] !== undefined) {
                              isAdministered = administeredRappels[vaccine.vaccin_id][index];
                              console.log(`Rappel ${index+1} utilisant administeredRappels[vaccin_id]: ${isAdministered}`);
                            }
                            // Priorité 3: Vérifier dans administeredRappels avec id
                            else if (administeredRappels[vaccine.id]?.[index] !== undefined) {
                              isAdministered = administeredRappels[vaccine.id][index];
                              console.log(`Rappel ${index+1} utilisant administeredRappels[id]: ${isAdministered}`);
                            }
                            
                            // Vérifications supplémentaires pour la robustesse
                            
                            // Vérifier d'après le texte de la description si nécessaire
                            const description = rappel.description || '';
                            if (!isAdministered && (description.toLowerCase().includes('administré') || 
                                description.toLowerCase().includes('fait'))) {
                              isAdministered = true;
                              console.log(`Rappel ${index+1} marqué administré via texte description`);
                            }
                            
                            // Calculer si le rappel est dû ou est aujourd'hui
                            const rappelDate = new Date(vaccine.date_vaccination);
                            rappelDate.setDate(rappelDate.getDate() + rappel.delai);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            
                            const isRappelDue = rappelDate < today && !isAdministered;
                            const isToday = (
                              rappelDate.getDate() === today.getDate() &&
                              rappelDate.getMonth() === today.getMonth() &&
                              rappelDate.getFullYear() === today.getFullYear() &&
                              !isAdministered
                            );
                            
                            // Couleurs dynamiques selon l'état
                            let textColor = isAdministered ? 'text-green-800' : isRappelDue ? 'text-yellow-800' : isToday ? 'text-yellow-800' : 'text-blue-800';
                            let iconColor = isAdministered ? 'text-green-500' : isRappelDue ? 'text-amber-500' : isToday ? 'text-amber-500' : 'text-blue-500';
                            
                            // Journalisation détaillée pour débogage
                            console.log(`Rappel ${index+1} du vaccin ${vaccine.name || vaccine.Nom} - administré: ${isAdministered}`, {
                              rappelIndex: index,
                              rappelDelai: rappel.delai,
                              vaccineId: vaccine.vaccin_id || vaccine.id,
                              isRappelDue,
                              isToday
                            });
                            
                            return (
                              <div key={`rappel-${index}`} className="flex items-center gap-1">
                                {index < vaccinesOfType.length-1 ? (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">Administré</span>
                                  </div>
                                ) : isRappelDue ? (
                                  <AlertTriangle className={`h-4 w-4 ${iconColor}`} />
                                ) : isToday ? (
                                  <AlertTriangle className={`h-4 w-4 ${iconColor}`} />
                                ) : (
                                  <Clock className={`h-4 w-4 ${iconColor}`} />
                                )}
                                <span className={`text-xs ${textColor}`}>
                                  {rappel.description || (isAdministered ? 'Administré' : (rappel.delai === 0 ? 'Immédiat' : `J+${rappel.delai}`))}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-500">Aucun rappel</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-gray-500 italic">Aucun vaccin administré</p>
        )}
      </div>

      {/* Pied de page */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-300 print:pt-2">
        <p>Document imprimé le {format(new Date(), "d MMMM yyyy à HH:mm", { locale: fr })}</p>
        <p className="mt-1">Centre de Santé de Base (CSB) - Système de gestion de vaccinations</p>
      </div>
    </div>
  );
};

export default ChildPrintView;
