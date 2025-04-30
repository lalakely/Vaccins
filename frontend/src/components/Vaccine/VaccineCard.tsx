import { Syringe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utilitaire pour combiner les classes Tailwind (optionnel)

interface VaccineCardProps {
  vaccine: { Nom: string; [key: string]: any };
  onDetailsClick: (vaccine: any) => void;
  className?: string;
}

function VaccineCard({ vaccine, onDetailsClick, className }: VaccineCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <CardHeader className="flex items-center gap-6 p-8 bg-gradient-to-r from-green-50 to-white rounded-t-xl">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 transition-transform duration-300 group-hover:scale-110">
          <Syringe className="w-8 h-8" />
        </div>
        <CardTitle className="text-2xl font-semibold text-gray-900 tracking-tight">
          {vaccine.Nom}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
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