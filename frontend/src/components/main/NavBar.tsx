import { Link } from "react-router-dom";
import { TbVaccine } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { FaRegMap } from "react-icons/fa";

function NavBar() {
    return (
        <>
            {/* Menu vertical pour grands écrans */}
            <div className="hidden lg:flex fixed top-0 left-0 h-full bg-blue-600 w-48 flex-col items-start text-white">
                <h2 className="text-xl font-bold mb-6 p-4">Menu</h2>
                <Link 
                    to="/" 
                    className="py-2 px-4 w-full text-left hover:bg-blue-700 rounded"
                >
                    <div className="flex justify-between items-center text-white">
                        <FaRegUser />
                        <span>Personnes </span>
                    </div>
                </Link>
                <Link 
                    to="/Vaccins" 
                    className="py-2 px-4 w-full text-left hover:bg-blue-700 rounded"
                >
                    <div className="flex justify-between items-center text-white">
                        <TbVaccine />
                        <span>Vaccins</span>
                    </div>
                </Link>
                <Link 
                    to="/Fokotany" 
                    className="py-2 px-4 w-full text-left hover:bg-blue-700 rounded"
                >
                    <div className="flex justify-between items-center text-white">
                        <LuMapPin />
                        <span>Fokotany</span>
                    </div>
                </Link>
                <Link 
                    to="/Hameau" 
                    className="py-2 px-4 w-full text-left hover:bg-blue-700 rounded"
                >
                    <div className="flex justify-between items-center text-white">
                        <FaRegMap />
                        <span>Hameau</span>
                    </div>
                </Link>
            </div>

            {/* Menu en bas pour petits écrans */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-blue-600 flex justify-around items-center text-white h-19">
                <Link 
                    to="/" 
                    className="flex flex-col items-center text-sm hover:bg-blue-700 w-full h-full"
                >
                    <div className="flex flex-col items-center text-white py-2">
                        <FaRegUser size={20} />
                        <span>Personnes</span>
                    </div>
                   
                </Link>
                <Link 
                    to="/Vaccins" 
                    className="flex flex-col items-center text-sm hover:bg-blue-700 w-full h-full"
                >
                    <div className="flex flex-col items-center text-white py-2">
                        <TbVaccine size={20} />
                        <span>Vaccins</span>
                    </div>
                </Link>
                <Link 
                    to="/Fokotany" 
                    className="flex flex-col items-center text-sm hover:bg-blue-700 w-full h-full"
                >
                    <div className="flex flex-col items-center text-white py-2">
                        <LuMapPin size={20} />
                        <span>Fokotany</span>
                    </div>
                </Link>
                <Link 
                    to="/Hameau" 
                    className="flex flex-col items-center text-sm hover:bg-blue-700 w-full h-full"
                >
                    <div className="flex flex-col items-center text-white py-2">
                        <FaRegMap size={20} />
                        <span>Hameau</span>
                    </div>
                </Link>
            </div>
        </>
    );
}

export default NavBar;
