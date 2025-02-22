import { Syringe } from "lucide-react"; // Import an icon
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function VaccineCard({ vaccine, onDetailsClick }) {
    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer w-full max-w-md mx-auto p-4">
            <CardHeader className="flex items-center gap-4">
                <Syringe className="w-8 h-8 text-green-500" />
                <CardTitle className="text-2xl text-gray-800">{vaccine.Nom}</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="link" onClick={() => onDetailsClick(vaccine)}>
                    Détails
                </Button>
            </CardContent>
        </Card>
    );
}

export default VaccineCard;