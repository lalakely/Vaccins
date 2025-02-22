import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react"; // Import an icon

export default function FokotanyCard({ fokotany, onDetailsClick }) {
    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer w-full max-w-md mx-auto p-4">
            <CardHeader className="flex items-center gap-4">
                <Home className="w-8 h-8 text-blue-500" />
                <CardTitle className="text-2xl text-gray-800">{fokotany.Nom}</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="link" onClick={() => onDetailsClick(fokotany)}>
                    Détails
                </Button>
            </CardContent>
        </Card>
    );
}
