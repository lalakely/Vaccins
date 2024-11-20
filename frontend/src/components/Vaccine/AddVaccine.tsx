import { MdOutlineVaccines } from "react-icons/md";

export default function AddVaccine () {
    return (
    <>  
        <div className="fixed top-0 w-full rounded-lg h-25 flex flex-row justify-around items-center p-4">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-600">
                La liste des Vaccins
            </h1>
            <button
                className="w-[200px] bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
            >
                Ajouter un vaccin
                <MdOutlineVaccines />
            </button>
        </div>
    </>);
}