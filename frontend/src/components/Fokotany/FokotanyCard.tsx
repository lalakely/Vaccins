import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FokotanyCard({ fokotany, onDetailsClick }) {
    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
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
