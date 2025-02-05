import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HameauCard({ hameau, onDetailsClick }) {
    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
                <CardTitle className="text-2xl text-gray-800">{hameau.Nom}</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="link" onClick={() => onDetailsClick(hameau)}>
                    Détails
                </Button>
            </CardContent>
        </Card>
    );
}
