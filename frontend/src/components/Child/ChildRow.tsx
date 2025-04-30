import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function ChildRow({ enfant, isEven, onDetailsClick }) {
    return (
        <TableRow className={`${isEven ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-all`}>
            <TableCell className="py-4 px-6 font-medium text-black text-left">{enfant.Nom}</TableCell>
            <TableCell className="py-4 px-6 text-gray-700 text-left">{enfant.Prenom}</TableCell>
            <TableCell className="py-4 px-6 text-gray-700 text-left">
                {new Date(enfant.date_naissance).toLocaleDateString()}
            </TableCell>
            <TableCell className="py-4 px-6 text-gray-700 text-left">{enfant.Domicile}</TableCell>
            <TableCell className="py-4 px-6 text-left">
                <Button 
                    variant="outline" 
                    onClick={() => onDetailsClick(enfant)} 
                    className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded-md shadow-sm"
                >
                    <Info className="w-4 h-4" />
                    <span>Détails</span>
                </Button>
            </TableCell>
        </TableRow>
    );
}