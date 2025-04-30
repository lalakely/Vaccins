import { Map } from "lucide-react"; // Import de l'icône Map
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utilitaire pour combiner les classes Tailwind (optionnel)

interface HameauCardProps {
  hameau: { Nom: string; [key: string]: any }; // Type flexible pour les propriétés du hameau
  onDetailsClick: (hameau: any) => void;
  className?: string; // Pour personnalisation externe
}

export default function HameauCard({ hameau, onDetailsClick, className }: HameauCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <CardHeader className="flex items-center gap-6 p-8 bg-gradient-to-r from-blue-50 to-white rounded-t-xl">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 transition-transform duration-300 group-hover:scale-110">
          <Map className="w-8 h-8" />
        </div>
        <CardTitle className="text-2xl font-semibold text-gray-900 tracking-tight">
          {hameau.Nom}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <Button
          variant="outline"
          className="w-full max-w-xs mx-auto border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
          onClick={() => onDetailsClick(hameau)}
        >
          Détails
        </Button>
      </CardContent>
    </Card>
  );
}