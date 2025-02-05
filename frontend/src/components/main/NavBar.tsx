import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TbVaccine } from "react-icons/tb";
import { FaRegUser, FaBars, FaTimes } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { FaRegMap } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function NavBar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState("");

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000); // Effet de chargement

        // Récupération du nom d'utilisateur depuis localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUsername(storedUser.username);
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <>
            {/* Bouton d’ouverture/fermeture */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`hidden lg:block fixed top-4 z-50 bg-white border border-gray-300 text-gray-700 p-1.5 rounded-full shadow-sm hover:bg-gray-200 transition-all ${
                    isSidebarOpen ? "left-[270px]" : "left-4"
                }`}
            >
                {isSidebarOpen ? <FaTimes size={20} className="opacity-80" /> : <FaBars size={20} className="opacity-80" />}
            </button>

            {/* Barre latérale */}
            <div
                className={`hidden lg:flex fixed top-0 left-0 h-full bg-muted w-64 flex-col items-start text-muted-foreground p-4 shadow-lg transition-all ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-64"
                }`}
            >
                {/* Nom de l'utilisateur */}
                <div className="text-lg font-semibold mb-6 text-primary flex items-center gap-2 p-3 bg-gray-100 rounded-lg w-full">
                    {isLoading ? (
                        <Skeleton className="h-6 w-32 bg-gray-300" />
                    ) : (
                        <span>{username || "Utilisateur"}</span>
                    )}
                </div>

                <Link
                    to="/Personnes"
                    className={`flex items-center w-full py-3 px-4 rounded-lg transition-colors ${
                        location.pathname === "/Personnes"
                            ? "bg-primary text-white"
                            : "hover:bg-gray-200"
                    }`}
                >
                    <FaRegUser className="mr-3" />
                    <span>Personnes</span>
                </Link>

                <Link
                    to="/Vaccins"
                    className={`flex items-center w-full py-3 px-4 rounded-lg transition-colors ${
                        location.pathname === "/Vaccins"
                            ? "bg-primary text-white"
                            : "hover:bg-gray-200"
                    }`}
                >
                    <TbVaccine className="mr-3" />
                    <span>Vaccins</span>
                </Link>

                <Link
                    to="/Fokotany"
                    className={`flex items-center w-full py-3 px-4 rounded-lg transition-colors ${
                        location.pathname === "/Fokotany"
                            ? "bg-primary text-white"
                            : "hover:bg-gray-200"
                    }`}
                >
                    <LuMapPin className="mr-3" />
                    <span>Fokotany</span>
                </Link>

                <Link
                    to="/Hameau"
                    className={`flex items-center w-full py-3 px-4 rounded-lg transition-colors ${
                        location.pathname === "/Hameau"
                            ? "bg-primary text-white"
                            : "hover:bg-gray-200"
                    }`}
                >
                    <FaRegMap className="mr-3" />
                    <span>Hameau</span>
                </Link>

                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="mt-auto w-full py-3 px-4 flex items-center justify-start text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                    Déconnexion
                </Button>
            </div>
        </>
    );
}

export default NavBar;
