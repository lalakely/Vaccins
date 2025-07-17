import { MapPin, AlertCircle } from "lucide-react"; // Import des icônes
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utilitaire pour combiner les classes Tailwind (optionnel)
import { useEffect, useState } from "react";
import axios from "axios";

interface FokotanyCardProps {
  fokotany: { ID?: number; id?: number; Nom: string; [key: string]: any }; // Type flexible pour les propriétés du fokotany
  onDetailsClick: (fokotany: any) => void;
  className?: string; // Pour personnalisation externe
}


export default function FokotanyCard({ fokotany, onDetailsClick, className }: FokotanyCardProps) {
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour charger le nombre d'enfants dans ce fokotany
  useEffect(() => {
    const fetchChildrenCount = async () => {
      // Utiliser ID ou id selon ce qui est disponible
      const fokotanyId = fokotany.ID || fokotany.id;
      if (!fokotanyId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`http://localhost:3000/api/fokotany/${fokotanyId}/count-enfants`);
        setChildrenCount(response.data.count);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger le nombre d\'enfants');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChildrenCount();
  }, [fokotany.ID, fokotany.id]);

  return (
    <Card
      className={cn(
        "w-full max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <CardHeader className="flex flex-col p-8 bg-gradient-to-r from-red-50 to-white rounded-t-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 transition-transform duration-300 group-hover:scale-110">
            <MapPin className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900 tracking-tight">
            {fokotany.Nom}
          </CardTitle>
        </div>
        
        {/* Section du nombre d'enfants */}
        <div className="mt-4">
          {isLoading ? (
            <div className="text-sm text-gray-500">Chargement des statistiques...</div>
          ) : error ? (
            <div className="flex items-center gap-1 text-sm text-red-500">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          ) : (
            <div className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-800 font-bold">
                {childrenCount}
              </span>
              <span>enfant{childrenCount > 1 ? 's' : ''} enregistré{childrenCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <Button
          variant="outline"
          className="w-full max-w-xs mx-auto border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
          onClick={() => onDetailsClick(fokotany)}
        >
          Détails
        </Button>
      </CardContent>
    </Card>
  );
}