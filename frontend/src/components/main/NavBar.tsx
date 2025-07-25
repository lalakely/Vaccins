import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaRegUser, FaBars, FaTimes, FaSignOutAlt, FaUsers, FaSyringe, FaChartBar, FaCog } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { FaRegMap } from "react-icons/fa";
import { FaHistory } from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import NotificationButton from "../notifications/NotificationButton";
import ApiConnectionStatus from "../ui/ApiConnectionStatus";
import { buildApiUrl } from "../../config/api";

function NavBar() {
  const { logout } = useAuth(); // Suppression de 'user' car non utilisé
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Navbar ouvert par défaut
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // ✅ Gère le dropdown utilisateur avec animation

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsername(parsedUser.username);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Aucun token trouvé.");
        return;
      }

      console.log("Token envoyé :", token);

      const response = await fetch(buildApiUrl("/api/auth/logout"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        logout();
        navigate("/");
      } else {
        console.error("Erreur lors de la déconnexion :", response.status);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  return (
    <>
      {/* Menu utilisateur en haut à droite avec animation */}
      <div className="fixed top-4 right-6 z-[var(--z-index-navbar)] flex items-center gap-3">
        <ApiConnectionStatus />
        <NotificationButton />
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full  hover:shadow-xl border border-gray-100 transition-all duration-300 group"
        >
          <div className="bg-primary text-white p-1.5 rounded-full group-hover:bg-primary/90 transition-all">
            <FaRegUser size={14} />
          </div>
          {isLoading ? 
            <Skeleton className="h-4 w-20 bg-gray-200" /> : 
            <span className="font-medium text-gray-700">{username || "Utilisateur"}</span>
          }
        </button>

        {/* Dropdown déconnexion avec animation */}
        <div
          className={`absolute right-0 mt-6 w-52 bg-white rounded-xl border border-gray-200 transition-all duration-300 ease-in-out transform z-[var(--z-index-navbar)] top-7 ${
            isDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
          }`}
        >
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Connecté en tant que</p>
            <p className="font-medium text-gray-800 flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1 rounded-full">
                <FaRegUser size={12} />
              </span>
              {username || "Utilisateur"}
            </p>
          </div>
          <Link 
            to="/settings"
            className="w-full text-left px-5 py-3.5 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-all rounded-full focus-visible:ring-1 focus-visible:ring-gray-600 focus-visible:outline-none"
          >
            <FaCog size={16} className="text-gray-700" />
            <span className="font-medium">Paramètres</span>
          </Link>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-5 py-3.5 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-all rounded-full focus-visible:ring-1 focus-visible:ring-red-600 focus-visible:outline-none"
          >
            <FaSignOutAlt size={16} className="text-red-600" />
            <span className="font-medium text-red-600">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Bouton d'ouverture du Navbar */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`hidden lg:block fixed top-6 z-[var(--z-index-navbar)] bg-white border border-gray-100 text-gray-700 p-2.5 rounded-full hover:bg-gray-50 transition-all duration-300
        ${isSidebarOpen ? "left-[275px]" : "left-[15px]"}`}
      >
        {isSidebarOpen ? 
          <FaTimes size={18} className="text-primary" /> : 
          <FaBars size={18} className="text-primary" />
        }
      </button>

      {/* Sidebar Desktop */}
      <div
        className={`hidden lg:flex fixed top-0 left-0 h-full bg-white w-64 flex-col text-muted-foreground z-[var(--z-index-content)] transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        {/* En-tête de la sidebar */}
        <div className="p-6 ">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <FaSyringe className="rotate-45" />
            <span>CSB Vaccins</span>
          </h1>
        </div>
        
        <nav className="flex flex-col gap-1 w-full mt-4 px-3 py-4">
          <NavItem to="/dashboard" icon={<FaChartBar size={18} />} label="Dashboard" active={location.pathname === "/dashboard"} />
          <NavItem to="/Personnes" icon={<FaUsers size={18} />} label="Personnes" active={location.pathname === "/Personnes"} />
          <NavItem to="/historique-enfants" icon={<FaHistory size={18} />} label="Historique" active={location.pathname === "/historique-enfants"} />
          <NavItem to="/Vaccins" icon={<FaSyringe size={18} />} label="Vaccins" active={location.pathname === "/Vaccins"} />
          <NavItem to="/Fokotany" icon={<LuMapPin size={18} />} label="Fokotany" active={location.pathname === "/Fokotany"} />
          <NavItem to="/Hameau" icon={<FaRegMap size={18} />} label="Hameau" active={location.pathname === "/Hameau"} />
         
        </nav>
      </div>

      {/* Navbar responsive en version mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white flex justify-around py-1 border-t border-gray-100 z-[var(--z-index-navbar)]">
        <MobileNavItem to="/dashboard" icon={<FaChartBar size={20} />} label="Dashboard" active={location.pathname === "/dashboard"} />
        <MobileNavItem to="/Personnes" icon={<FaUsers size={20} />} label="Personnes" active={location.pathname === "/Personnes"} />
        <MobileNavItem to="/historique-enfants" icon={<FaHistory size={20} />} label="Historique" active={location.pathname === "/historique-enfants"} />
        <MobileNavItem to="/Vaccins" icon={<FaSyringe size={20} />} label="Vaccins" active={location.pathname === "/Vaccins"} />
        <MobileNavItem to="/Fokotany" icon={<LuMapPin size={20} />} label="Fokotany" active={location.pathname === "/Fokotany"} />
        <MobileNavItem to="/Hameau" icon={<FaRegMap size={20} />} label="Hameau" active={location.pathname === "/Hameau"} />
      </div>
    </>
  );
}

/**
 * Composant pour un élément de navigation
 */
function NavItem({ to, icon, label, active }: { to: string; icon: JSX.Element; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
        active 
          ? "bg-primary/10 text-primary font-semibold rounded-full" 
          : "text-gray-600 hover:bg-gray-50 hover:text-primary hover:rounded-full"
      }`}
    >
      <div className={`${active ? "text-primary" : "text-gray-500"}`}>{icon}</div>
      <span>{label}</span>
    </Link>
  );
}

/**
 * Composant pour un élément de navigation mobile
 */
function MobileNavItem({ to, icon, label, active }: { to: string; icon: JSX.Element; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center py-2 px-1 w-full transition-all ${active ? "" : "hover:bg-gray-50"}`}
    >
      <div 
        className={`p-2 mb-1 transition-all duration-200 ${active ? "text-primary bg-primary/10 rounded-full" : "text-gray-500 hover:bg-primary/5 hover:rounded-full"}`}
      >
        {icon}
      </div>
      <span className={`text-xs ${active ? "text-primary font-medium" : "text-gray-600"}`}>
        {label}
      </span>
    </Link>
  );
}

export default NavBar;