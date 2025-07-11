import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Info, User, Calendar, MapPin, Tag } from "lucide-react";
import { useState } from "react";

interface Enfant {
    id: number;
    Nom?: string;
    Prenom?: string;
    CODE?: string;
    date_naissance: string;
    SEXE?: 'M' | 'F' | string;
    Domicile?: string;
    Fokotany?: string;
    Hameau?: string;
    [key: string]: any;
}

interface ChildRowProps {
    enfant: Enfant;
    isEven: boolean;
    onDetailsClick: (enfant: Enfant) => void;
}

export default function ChildRow({ enfant, isEven, onDetailsClick }: ChildRowProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    // Calculer l'âge
    const calculateAge = (dateString: string): number => {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };
    
    // Formater la date de naissance
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };
    
    // Déterminer la classe de sexe pour le badge
    const getSexeClass = () => {
        return enfant.SEXE === 'M' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
               enfant.SEXE === 'F' ? 'bg-pink-50 text-pink-700 border-pink-200' : 
               'bg-gray-50 text-gray-700 border-gray-200';
    };
    
    return (
        <TableRow 
            className={`${isEven ? "bg-white" : "bg-gray-50"} hover:bg-primary/5 transition-all duration-200 group`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onDetailsClick(enfant)}
            style={{ cursor: 'pointer' }}
        >
            <TableCell className="py-3 px-4 text-left">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 rounded-full p-1.5">
                        <User size={16} className="text-primary" />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800">{enfant.Nom || 'N/A'}</div>
                        {enfant.CODE && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Tag size={10} />
                                Code: {enfant.CODE}
                            </div>
                        )}
                    </div>
                </div>
            </TableCell>
            
            <TableCell className="py-3 px-4 text-gray-700 text-left">
                <div className="font-medium">{enfant.Prenom || 'N/A'}</div>
                <div className="text-xs text-gray-500 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border ${getSexeClass()}`}>
                        {enfant.SEXE === 'M' ? 'Garçon' : enfant.SEXE === 'F' ? 'Fille' : 'Non spécifié'}
                    </span>
                </div>
            </TableCell>
            
            <TableCell className="py-3 px-4 text-gray-700 text-left">
                <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-primary mt-0.5" />
                    <div>
                        <div>{formatDate(enfant.date_naissance)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {calculateAge(enfant.date_naissance)} ans
                        </div>
                    </div>
                </div>
            </TableCell>
            
            <TableCell className="py-3 px-4 text-gray-700 text-left">
                <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-primary mt-0.5" />
                    <div>
                        <div>{enfant.Domicile || 'N/A'}</div>
                        {(enfant.Fokotany || enfant.Hameau) && (
                            <div className="text-xs text-gray-500 mt-0.5">
                                {[enfant.Fokotany, enfant.Hameau].filter(Boolean).join(', ')}
                            </div>
                        )}
                    </div>
                </div>
            </TableCell>
            
            <TableCell className="py-3 px-4 text-right w-[120px]">
                <Button 
                    variant="ghost" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDetailsClick(enfant);
                    }} 
                    className={`rounded-full h-9 w-9 p-0 flex items-center justify-center ${isHovered ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'} transition-all duration-200`}
                >
                    <Info className="w-4 h-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}