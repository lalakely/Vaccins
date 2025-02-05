import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ChildRow({ enfant, isEven, onDetailsClick }) {
    return (
        <TableRow className={isEven ? "bg-gray-50" : "bg-white"}>
            <TableCell className="py-4 px-6 font-medium text-black">{enfant.Nom}</TableCell>
            <TableCell className="py-4 px-6 text-gray-700">{enfant.Prenom}</TableCell>
            <TableCell className="py-4 px-6 text-gray-700">
                {new Date(enfant.date_naissance).toLocaleDateString()}
            </TableCell>
            <TableCell className="py-4 px-6 text-gray-700">{enfant.Domicile}</TableCell>
            <TableCell className="py-4 px-6">
                <Button variant="link" onClick={() => onDetailsClick(enfant)}>
                    Détails
                </Button>
            </TableCell>
        </TableRow>
    );
}
