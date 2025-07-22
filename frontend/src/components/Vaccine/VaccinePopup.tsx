import {
  CalendarDaysIcon,
  ClockIcon,
  InformationCircleIcon,
  ClipboardDocumentListIcon,
  TrashIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/solid";
import { PackageX, AlertTriangle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import EditVaccine from "./EditVaccine";
import { Vaccine, VaccineWithRelations } from "@/types/vaccine";
import { buildApiUrl } from "../../config/api";

interface Rappel {
  delai: number;
  description: string;
}

interface VaccinePopupProps {
  vaccine: Vaccine;
  onClose: () => void;
}

function VaccinePopup({ vaccine, onClose }: VaccinePopupProps) {
  // Vérifier si le vaccin est périmé
  const isExpired = useMemo(() => {
    if (!vaccine.Date_peremption) return false;
    
    const currentDate = new Date();
    const expiryDate = new Date(vaccine.Date_peremption);
    
    return currentDate > expiryDate;
  }, [vaccine.Date_peremption]);
  const [loading, setLoading] = useState(false);
  const [prerequisVaccins, setPrerequisVaccins] = useState<VaccineWithRelations[]>([]);
  const [loadingPrereq, setLoadingPrereq] = useState(false);
  const [errorPrereq, setErrorPrereq] = useState<string | null>(null);
  
  // États pour les vaccins suites
  const [suiteVaccins, setSuiteVaccins] = useState<VaccineWithRelations[]>([]);
  const [loadingSuite, setLoadingSuite] = useState(false);
  const [errorSuite, setErrorSuite] = useState<string | null>(null);
  
  // États pour les rappels
  const [rappels, setRappels] = useState<Rappel[]>([]);
  const [loadingRappels, setLoadingRappels] = useState(false);
  const [errorRappels, setErrorRappels] = useState<string | null>(null);
  
  // Charger les vaccins prérequis
  useEffect(() => {
    if (!vaccine || !vaccine.id) return;
    
    const fetchPrerequisVaccins = async () => {
      setLoadingPrereq(true);
      setErrorPrereq(null);
      
      try {
        const response = await fetch(buildApiUrl(`/api/vaccins/${vaccine.id}/prerequis`));
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des vaccins prérequis');
        }
        
        const data = await response.json() as VaccineWithRelations[];
        setPrerequisVaccins(data);
      } catch (err) {
        console.error('Erreur:', err);
        setErrorPrereq('Impossible de charger les vaccins prérequis');
      } finally {
        setLoadingPrereq(false);
      }
    };
    
    fetchPrerequisVaccins();
  }, [vaccine]);
  
  // Charger les vaccins suites
  useEffect(() => {
    if (!vaccine || !vaccine.id) return;
    
    const fetchSuiteVaccins = async () => {
      setLoadingSuite(true);
      setErrorSuite(null);
      
      try {
        const response = await fetch(buildApiUrl(`/api/vaccins/${vaccine.id}/suites`));
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des vaccins suites');
        }
        
        const data = await response.json() as VaccineWithRelations[];
        console.log('Suite vaccins data:', data);
        
        // Normaliser les données pour garantir que les champs strict et delai sont correctement typés
        const normalizedData = data.map(suite => ({
          ...suite,
          strict: suite.strict === true || Number(suite.strict) === 1 || String(suite.strict) === '1',
          delai: typeof suite.delai === 'string' ? parseInt(suite.delai, 10) || 0 : (suite.delai || 0)
        }));
        
        console.log('Normalized suite data:', normalizedData);
        setSuiteVaccins(normalizedData);
      } catch (err) {
        console.error('Erreur:', err);
        setErrorSuite('Impossible de charger les vaccins suites');
      } finally {
        setLoadingSuite(false);
      }
    };
    
    fetchSuiteVaccins();
  }, [vaccine]);
  
  // Charger les rappels
  useEffect(() => {
    if (!vaccine || !vaccine.id) return;
    
    const fetchRappels = async () => {
      setLoadingRappels(true);
      setErrorRappels(null);
      
      try {
        const response = await fetch(buildApiUrl(`/api/vaccins/${vaccine.id}/rappels`));
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des rappels');
        }
        
        const data = await response.json() as Rappel[];
        console.log('Rappels data:', data);
        
        // Normaliser les données pour garantir que le champ delai est correctement typé
        const normalizedData = data.map(rappel => ({
          ...rappel,
          delai: typeof rappel.delai === 'string' ? parseInt(rappel.delai, 10) || 0 : (rappel.delai || 0)
        }));
        
        setRappels(normalizedData);
      } catch (err) {
        console.error('Erreur lors du chargement des rappels:', err);
        setErrorRappels('Impossible de charger les rappels');
      } finally {
        setLoadingRappels(false);
      }
    };
    
    fetchRappels();
  }, [vaccine]);

  if (!vaccine) return null;

  const handleDelete = async () => {
    if (!vaccine || !vaccine.id) return;
   
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/api/vaccins/${vaccine.id}`), { // Correction de l'appel à buildApiUrl
        method: 'DELETE',
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) { 
        onClose(); // Fermer la popup après suppression
        window.location.reload()
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Échec de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex flex-col max-h-[85vh]">
        {/* Contenu en deux colonnes avec défilement */}
        <div className="p-6 sm:p-8 text-gray-800 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 flex-1">
          {/* Layout en deux colonnes avec grille */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche: informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-700 border-b border-red-200 pb-2 mb-4">Informations de base</h3>
              
              <div className="flex items-start gap-2">
                <ClipboardDocumentListIcon className="h-5 w-5 text-red-500 mt-1" />
                <span><span className="font-semibold">Nom :</span> {vaccine.Nom}</span>
              </div>

              <div className="flex items-start gap-2">
                <ClockIcon className="h-5 w-5 text-red-500 mt-1" />
                <span><span className="font-semibold">Durée :</span> {vaccine.Duree} jours</span>
              </div>

              <div className="flex items-start gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-red-500 mt-1" />
                <span><span className="font-semibold">Arrivée :</span> {new Date(vaccine.Date_arrivee).toLocaleDateString()}</span>
              </div>

              <div className="flex items-start gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-red-500 mt-1" />
                <span><span className="font-semibold">Péremption :</span> {new Date(vaccine.Date_peremption).toLocaleDateString()}</span>
              </div>

              <div className="flex items-start gap-2">
                <InformationCircleIcon className="h-5 w-5 text-red-500 mt-1" />
                <span><span className="font-semibold">Description :</span> {vaccine.Description}</span>
              </div>

                            <div>
                {/* Indicateur de péremption */}
                {isExpired && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-600 mb-4">
                    <AlertTriangle size={18} />
                    <span className="font-medium">Vaccin périmé - Ne pas utiliser, date de péremption dépassée ({new Date(vaccine.Date_peremption).toLocaleDateString()})</span>
                  </div>
                )}
                
                {/* Indicateur de stock épuisé */}
                {!isExpired && vaccine.Stock === 0 && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-3 rounded-md text-red-600 mb-4">
                    <PackageX size={18} />
                    <span className="font-medium">Stock épuisé - Ce vaccin n'est plus disponible</span>
                  </div>
                )}

                <div className="flex items-start gap-8 mb-4">
                  <div className="text-gray-700">
                    <p className="font-semibold">Lot:</p>
                    <p>{vaccine.Lot || 'Non spécifié'}</p>
                  </div>
                  <div className="text-gray-700">
                    <p className="font-semibold">Stock:</p>
                    {isExpired ? (
                      <div className="flex items-center text-amber-600 font-medium gap-1">
                        <AlertTriangle size={16} />
                        <span>Périmé</span>
                      </div>
                    ) : vaccine.Stock === 0 ? (
                      <div className="flex items-center text-red-600 font-medium gap-1">
                        <PackageX size={16} />
                        <span>Épuisé</span>
                      </div>
                    ) : (
                      <p>{vaccine.Stock !== undefined ? vaccine.Stock : 'Non spécifié'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Affichage de l'âge recommandé pour la prescription */}
              <div className="flex items-start gap-2">
                <ClockIcon className="h-5 w-5 text-red-500 mt-1" />
                <div>
                  <span className="font-semibold">Âge recommandé : </span>
                  {(vaccine.Age_Annees || vaccine.Age_Mois || vaccine.Age_Jours) ? (
                    <span>
                      {(vaccine.Age_Annees && vaccine.Age_Annees > 0) ? `${vaccine.Age_Annees} an${vaccine.Age_Annees > 1 ? 's' : ''}` : ''}
                      {(vaccine.Age_Mois && vaccine.Age_Mois > 0) ? ` ${vaccine.Age_Mois} mois` : ''}
                      {(vaccine.Age_Jours && vaccine.Age_Jours > 0) ? ` ${vaccine.Age_Jours} jour${vaccine.Age_Jours > 1 ? 's' : ''}` : ''}
                    </span>
                  ) : (
                    <span className="text-sm italic text-gray-500">Aucun âge minimum requis</span>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite: vaccins prérequis, à suivre et rappels */}
            <div className="space-y-6 border-l-0 md:border-l border-red-100 pl-0 md:pl-6">
              <h3 className="text-lg font-semibold text-red-700 border-b border-red-200 pb-2 mb-4">Relations avec d'autres vaccins</h3>
              
              {/* Affichage des vaccins prérequis */}
              <div className="mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <ShieldCheckIcon className="h-5 w-5 text-red-500 mt-1" />
                  <span className="font-semibold">Vaccins prérequis :</span>
                </div>
                
                <div className="pl-7">
                  {loadingPrereq && <p className="text-sm text-gray-500">Chargement des prérequis...</p>}
                  
                  {errorPrereq && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span>{errorPrereq}</span>
                    </div>
                  )}
                  
                  {!loadingPrereq && !errorPrereq && prerequisVaccins.length === 0 && (
                    <p className="text-sm text-gray-500">Aucun vaccin prérequis nécessaire</p>
                  )}
                  
                  {!loadingPrereq && !errorPrereq && prerequisVaccins.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1">
                      {prerequisVaccins.map(prereq => (
                        <li key={prereq.id} className="text-sm flex items-center">
                          <span>{prereq.Nom}</span>
                          {prereq.strict ? (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Strict
                            </span>
                          ) : (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Optionnel
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Affichage des vaccins suites */}
              <div className="mt-4">
                <div className="flex items-start gap-2 mb-2">
                  <ArrowRightIcon className="h-5 w-5 text-green-500 mt-1" />
                  <span className="font-semibold">Vaccins à suivre :</span>
                </div>
                
                <div className="pl-7">
                  {loadingSuite && <p className="text-sm text-gray-500">Chargement des vaccins suites...</p>}
                  
                  {errorSuite && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span>{errorSuite}</span>
                    </div>
                  )}
                  
                  {!loadingSuite && !errorSuite && suiteVaccins.length === 0 && (
                    <p className="text-sm text-gray-500">Aucun vaccin suite nécessaire</p>
                  )}
                  
                  {!loadingSuite && !errorSuite && suiteVaccins.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1">
                      {suiteVaccins.map(suite => (
                        <li key={suite.id} className="text-sm flex flex-wrap items-center gap-2">
                          <span>{suite.Nom}</span>
                          
                          {/* Debug du statut strict - ne pas afficher mais laisser pour le débogage */}
                          {(() => { console.log(`Suite ${suite.id} (${suite.Nom}): strict=${suite.strict}, type=${typeof suite.strict}`); return null; })()}
                          
                          {/* Affichage du statut strict/optionnel */}
                          {suite.strict === true ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Strict
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Optionnel
                            </span>
                          )}
                          
                          {/* Affichage du délai - toujours affiché */}
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {suite.delai === 0 || suite.delai === undefined ? 'Immédiatement après' : `Après ${suite.delai} jour${suite.delai > 1 ? 's' : ''}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              {/* Affichage des rappels */}
              <div className="mt-6">
                <div className="flex items-start gap-2 mb-2">
                  <CalendarDaysIcon className="h-5 w-5 text-amber-500 mt-1" />
                  <span className="font-semibold">Rappels :</span>
                </div>
                
                <div className="pl-7">
                  {loadingRappels && <p className="text-sm text-gray-500">Chargement des rappels...</p>}
                  
                  {errorRappels && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      <span>{errorRappels}</span>
                    </div>
                  )}
                  
                  {!loadingRappels && !errorRappels && rappels.length === 0 && (
                    <p className="text-sm text-gray-500">Aucun rappel programmé</p>
                  )}
                  
                  {!loadingRappels && !errorRappels && rappels.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1">
                      {rappels.map((rappel, index) => (
                        <li key={index} className="text-sm flex flex-wrap items-center gap-2">
                          {/* Délai du rappel */}
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            {rappel.delai === 0 ? 'Immédiatement après' : `Après ${rappel.delai} jour${rappel.delai > 1 ? 's' : ''}`}
                          </span>
                          
                          {/* Description du rappel si disponible */}
                          {rappel.description && (
                            <span className="text-gray-700">{rappel.description}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>  
          </div>

          {/* Boutons d'actions */}
          <div className="pt-6 mt-6 flex gap-4 border-t border-red-100">
            {/* Composant de modification */}
            <EditVaccine 
              vaccine={vaccine as any} 
              onEditSuccess={() => {
                onClose();
                window.location.reload();
              }} 
            />
            
            {/* Bouton de suppression */}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 bg-red-500 text-white font-semibold px-4 py-2 hover:bg-red-600 transition disabled:opacity-50 rounded-full"
            >
              <TrashIcon className="h-5 w-5" />
              {loading ? "Suppression..." : "Supprimer le vaccin"}
            </button>
          </div>
        </div>
      </div>
    
  );
}

export default VaccinePopup;
