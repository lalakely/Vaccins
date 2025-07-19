import { Syringe, AlertCircle, PackageX, AlertTriangle, Calendar, Clock, Tag, Package, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utilitaire pour combiner les classes Tailwind (optionnel)
import { useEffect, useState, useMemo } from "react";
import { Vaccine } from "@/types/vaccine";

interface VaccinationStat {
  count: number;
}

interface VaccineCardProps {
  vaccine: Vaccine;
  onDetailsClick: (vaccine: any) => void;
  className?: string;
}

function VaccineCard({ vaccine, onDetailsClick, className }: VaccineCardProps) {
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier si le vaccin est périmé
  const isExpired = useMemo(() => {
    if (!vaccine.Date_peremption) return false;
    
    const currentDate = new Date();
    const expiryDate = new Date(vaccine.Date_peremption);
    
    return currentDate > expiryDate;
  }, [vaccine.Date_peremption]);
  
  // Fonction pour charger le nombre d'enfants vaccinés par ce vaccin
  useEffect(() => {
    const fetchChildrenCount = async () => {
      if (!vaccine.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:3000/api/vaccins/${vaccine.id}/count-enfants`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du nombre d\'enfants vaccinés');
        }
        
        const data = await response.json() as VaccinationStat;
        setChildrenCount(data.count);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger le nombre d\'enfants vaccinés');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChildrenCount();
  }, [vaccine.id]);
  
  // Déterminer si le stock est épuisé
  const isStockEmpty = vaccine.Stock === 0;
  
  // Déterminer la priorité des alertes (épuisé vs périmé)
  // L'affichage sera différent en fonction de l'état le plus critique
  
  return (
    <Card
      className={cn(
        "flex flex-col w-full md:min-w-[420px] lg:min-w-[480px] transition-all duration-300 rounded-xl overflow-hidden",
        isExpired ? 'border-amber-200 bg-amber-50' : (isStockEmpty ? 'border-red-200 bg-red-50' : 'border-gray-100'),
        className
      )}
    >
      <CardHeader className={`flex flex-col p-5 md:p-8 rounded-t-xl ${
          isExpired ? 'bg-gradient-to-br from-amber-50 via-amber-50/50 to-white' : 
          (isStockEmpty ? 'bg-gradient-to-br from-red-50 via-red-50/50 to-white' : 
           'bg-gradient-to-br from-green-50 via-green-50/50 to-white')
        }`}>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className={`flex items-center justify-center w-16 h-16 rounded-full transition-transform duration-300 ${isExpired ? 'bg-amber-100 text-amber-600' : (isStockEmpty ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600')}`}>
            {isExpired ? <AlertTriangle className="w-8 h-8" /> : (isStockEmpty ? <PackageX className="w-8 h-8" /> : <Syringe className="w-8 h-8" />)}
          </div>
          <CardTitle className={`text-xl md:text-2xl font-semibold tracking-tight max-w-[200px] md:max-w-[250px] truncate ${isExpired ? 'text-amber-800' : (isStockEmpty ? 'text-gray-700' : 'text-gray-900')}`}>
            {vaccine.Nom}
          </CardTitle>
          {isExpired && (
            <div className="flex items-center px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-600 text-sm font-medium">
              <AlertTriangle size={14} className="mr-1.5" />
              Vaccin périmé
            </div>
          )}
          {!isExpired && isStockEmpty && (
            <div className="flex items-center px-3 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-600 text-sm font-medium">
              <PackageX size={14} className="mr-1.5" />
              Stock épuisé
            </div>
          )}
          {!isExpired && !isStockEmpty && (
            <div className="flex items-center px-3 py-1.5 rounded-full bg-green-100 border border-green-200 text-green-600 text-sm font-medium">
              <Package size={14} className="mr-1.5" />
              En stock
            </div>
          )}
        </div>
        
        {/* Section du nombre d'enfants vaccinés */}
        <div className="mt-4">
        
          
          {isLoading ? (
            <div className="text-sm text-gray-500">Chargement des statistiques...</div>
          ) : error ? (
            <div className="flex items-center gap-1 text-sm text-red-500">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          ) : (
            <div className="text-sm font-semibold text-green-600 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 font-bold">
                {childrenCount}
              </span>
              <span>enfant{childrenCount > 1 ? 's' : ''} vacciné{childrenCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5 md:p-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg h-full">
            <div className="flex items-center text-sm text-gray-700 mb-1.5">
              <Tag size={16} className="mr-1.5 text-blue-500" />
              <p className="font-semibold">Numéro de lot</p>
            </div>
            <p className="pl-6 text-base overflow-hidden text-ellipsis">{vaccine.Lot || 'Non spécifié'}</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg h-full">
            <div className="flex items-center text-sm text-gray-700 mb-1.5">
              <Layers size={16} className="mr-1.5 text-purple-500" />
              <p className="font-semibold">Stock disponible</p>
            </div>
            {isExpired ? (
              <div className="flex items-center text-amber-600 font-medium gap-1.5 pl-6">
                <AlertTriangle size={16} />
                <span className="text-base">Périmé</span>
              </div>
            ) : vaccine.Stock === 0 ? (
              <div className="flex items-center text-red-600 font-medium gap-1.5 pl-6">
                <PackageX size={16} />
                <span className="text-base">Épuisé</span>
              </div>
            ) : (
              <p className="pl-6 text-lg font-semibold text-purple-600">{vaccine.Stock !== undefined ? vaccine.Stock : 'Non spécifié'}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg h-full">
            <div className="flex items-center text-sm text-gray-700 mb-1.5">
              <Calendar size={16} className="mr-1.5 text-green-500" />
              <p className="font-semibold">Date d'arrivée</p>
            </div>
            <p className="pl-6 text-base overflow-hidden text-ellipsis">
              {vaccine.Date_arrivee ? new Date(vaccine.Date_arrivee).toLocaleDateString() : 'Non spécifié'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg h-full">
            <div className="flex items-center text-sm text-gray-700 mb-1.5">
              <Clock size={16} className="mr-1.5 text-orange-500" />
              <p className="font-semibold">Date de péremption</p>
            </div>
            {isExpired ? (
              <div className="flex items-center text-amber-600 font-medium gap-1.5 pl-6">
                <AlertTriangle size={16} />
                <span className="text-base">{new Date(vaccine.Date_peremption).toLocaleDateString()}</span>
              </div>
            ) : (
              <p className="pl-6 text-base overflow-hidden text-ellipsis">
                {vaccine.Date_peremption ? new Date(vaccine.Date_peremption).toLocaleDateString() : 'Non spécifié'}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          className={`w-full mt-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${
            isExpired 
              ? 'border-amber-400 text-amber-600 hover:bg-amber-50 hover:text-amber-700'
              : (isStockEmpty 
                ? 'border-gray-400 text-gray-600 hover:bg-gray-50 hover:text-gray-700' 
                : 'border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700')
          }`}
          onClick={() => onDetailsClick(vaccine)}
        >
          {isExpired 
            ? <><AlertTriangle size={18} /> Voir détails (Périmé)</> 
            : (isStockEmpty 
                ? <><PackageX size={18} /> Voir détails (Épuisé)</> 
                : <><Syringe size={18} /> Voir détails</>)
          }
        </Button>
      </CardContent>
    </Card>
  );
}

export default VaccineCard;