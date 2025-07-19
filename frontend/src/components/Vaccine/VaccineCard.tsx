import { Syringe, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utilitaire pour combiner les classes Tailwind (optionnel)
import { useEffect, useState } from "react";

interface Vaccine {
  id: number;
  Nom: string;
  Duree: string;
  Date_arrivee: string;
  Date_peremption: string;
  Description: string;
  Lot: string;
  Stock: number;
  [key: string]: any;
}

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
  
  return (
    <Card
      className={cn(
        "w-full max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <CardHeader className="flex flex-col p-8 bg-gradient-to-r from-green-50 to-white rounded-t-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 transition-transform duration-300 group-hover:scale-110">
            <Syringe className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900 tracking-tight">
            {vaccine.Nom}
          </CardTitle>
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
      <CardContent className="p-8 space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
          <div>
            <p className="font-semibold">Lot:</p>
            <p>{vaccine.Lot || 'Non spécifié'}</p>
          </div>
          <div>
            <p className="font-semibold">Stock:</p>
            <p>{vaccine.Stock !== undefined ? vaccine.Stock : 'Non spécifié'}</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full max-w-xs mx-auto border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
          onClick={() => onDetailsClick(vaccine)}
        >
          Détails
        </Button>
      </CardContent>
    </Card>
  );
}

export default VaccineCard;