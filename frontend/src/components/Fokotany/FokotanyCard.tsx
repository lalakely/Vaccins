import { MapPin } from "lucide-react"; // Import de l'icône MapPin
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utilitaire pour combiner les classes Tailwind (optionnel)

interface FokotanyCardProps {
  fokotany: { Nom: string; [key: string]: any }; // Type flexible pour les propriétés du fokotany
  onDetailsClick: (fokotany: any) => void;
  className?: string; // Pour personnalisation externe
}

export default function FokotanyCard({ fokotany, onDetailsClick, className }: FokotanyCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <CardHeader className="flex items-center gap-6 p-8 bg-gradient-to-r from-red-50 to-white rounded-t-xl">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 transition-transform duration-300 group-hover:scale-110">
          <MapPin className="w-8 h-8" />
        </div>
        <CardTitle className="text-2xl font-semibold text-gray-900 tracking-tight">
          {fokotany.Nom}
        </CardTitle>
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