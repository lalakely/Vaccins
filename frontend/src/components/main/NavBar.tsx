import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaRegUser, FaBars, FaTimes, FaSignOutAlt, FaUsers, FaSyringe, FaChartBar } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { FaRegMap } from "react-icons/fa";

import { useAuth } from "../../contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

function NavBar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Navbar ouvert par défaut
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // ✅ Gère le dropdown utilisateur avec animation

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUsername(storedUser.username);
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

      const response = await fetch("http://localhost:3000/api/auth/logout", {
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
      {/* ✅ Menu utilisateur en haut à droite avec animation */}
      <div className="fixed top-4 right-6 z-50">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full shadow-md hover:bg-gray-200 transition-all"
        >
          <FaRegUser size={18} className="text-primary" />
          {isLoading ? <Skeleton className="h-4 w-20 bg-gray-300" /> : <span className="text-sm">{username || "Utilisateur"}</span>}
        </button>

        {/* ✅ Dropdown déconnexion avec animation */}
        <div
          className={`absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border border-gray-200 transition-all duration-300 ease-in-out transform ${
            isDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
          }`}
        >
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-all"
          >
            <FaSignOutAlt className="inline mr-2" /> Déconnexion
          </button>
        </div>
      </div>

      {/* ✅ Bouton d'ouverture du Navbar bien placé avec une petite marge */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`hidden lg:block fixed top-6 z-50 bg-white border border-gray-300 text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-200 transition-all
        ${isSidebarOpen ? "left-[275px]" : "left-[15px]"}`}
      >
        {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* ✅ Sidebar Desktop */}
      <div
        className={`hidden lg:flex fixed top-0 left-0 h-full bg-muted w-64 flex-col text-muted-foreground p-5 shadow-lg transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <nav className="flex flex-col gap-3 w-full mt-5">
          <NavItem to="/dashboard" icon={<FaChartBar size={18} />} label="Dashboard" active={location.pathname === "/dashboard"} />
          <NavItem to="/Personnes" icon={<FaUsers size={18} />} label="Personnes" active={location.pathname === "/Personnes"} />
          <NavItem to="/Vaccins" icon={<FaSyringe size={18} />} label="Vaccins" active={location.pathname === "/Vaccins"} />
          <NavItem to="/Fokotany" icon={<LuMapPin size={18} />} label="Fokotany" active={location.pathname === "/Fokotany"} />
          <NavItem to="/Hameau" icon={<FaRegMap size={18} />} label="Hameau" active={location.pathname === "/Hameau"} />
        </nav>
      </div>

      {/* ✅ Navbar responsive en version mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around py-2 border-t border-gray-300 text-sm">
        <NavItem to="/dashboard" icon={<FaChartBar size={20} />} label="Dashboard" active={location.pathname === "/dashboard"} />
        <NavItem to="/Personnes" icon={<FaUsers size={20} />} label="Personnes" active={location.pathname === "/Personnes"} />
        <NavItem to="/Vaccins" icon={<FaSyringe size={20} />} label="Vaccins" active={location.pathname === "/Vaccins"} />
        <NavItem to="/Fokotany" icon={<LuMapPin size={20} />} label="Fokotany" active={location.pathname === "/Fokotany"} />
        <NavItem to="/Hameau" icon={<FaRegMap size={20} />} label="Hameau" active={location.pathname === "/Hameau"} />
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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm ${
        active ? "bg-primary text-white font-semibold" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default NavBar;