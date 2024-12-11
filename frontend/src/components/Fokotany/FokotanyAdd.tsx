import { CiCirclePlus } from "react-icons/ci";
import { useState } from "react";

function FokotanyAdd (){
    const [isModalOpen , setIsModalOpen] = useState(false);
    const [formData , setFormData] = useState({
        Nom: '',
        px: '',
        py:''
    });

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e) => {
        const {name , value} = e.target;
        setFormData({... formData , [name]: value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Donnés du fokotany vers le backend :' , formData);
        try {
            const response = await fetch('http://localhost:3000/api/fokotany' , {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify(formData),
            });
            if(response.ok) {
                const data = await response.text();
                console.log('Fokotany ajouté : ' , data);
                setFormData({
                    Nom: '',
                    px:'',
                    py:''
                });
                handleCloseModal();
                window.location.reload();
            }else {
                console.log('Erreur réseau:' , error);
            }
        } catch (error) {
            console.error('Erreur réseau :' , error);
        }
    }

    return (
        <>
            <div className="fixed top-0 w-full rounded-lg h-25 flex flex-row justify-around items-center p-4">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-600">
                    La liste des fokotany
                </h1>
                <button
                    onClick={handleOpenModal}
                    className="w-[200px] bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-between gap-2"
                >
                    Ajouter un fokotany
                    <CiCirclePlus className="text-xl" />
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Ajouter un enfant</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-6">
                                <div className="flex-1 space-y-4 ">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 text-left">Nom :</label>
                                        <input
                                            type="text"
                                            name="Nom"
                                            value={formData.Nom}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 text-left">Px :</label>
                                        <input
                                            type="text"
                                            name="px"
                                            value={formData.px}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 text-left">Py :</label>
                                        <input
                                            type="text"
                                            name="py"
                                            value={formData.py}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="submit"
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Enregistrer
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                </div>
                </div>
            )}
        </>
    );
}

export default FokotanyAdd;