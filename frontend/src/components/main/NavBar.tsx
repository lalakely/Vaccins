import { Link } from "react-router-dom";

function NavBar() {
    return (
        <div className="fixed top-0 left-0 h-full bg-blue-600 w-48 flex flex-col items-start p-4 text-white">
            <h2 className="text-xl font-bold mb-6">Menu</h2>
            <Link 
                to="/" 
                className="py-2 px-4 mb-2 w-full text-left hover:text-white hover:bg-blue-700 rounded text-white"
            >
                Enfants
            </Link>
            <Link 
                to="/Vaccins" 
                className="py-2 px-4 w-full text-left hover:bg-blue-700 hover:text-white rounded text-white"
            >
                Vaccins
            </Link>
        </div>
    );
}

export default NavBar;
