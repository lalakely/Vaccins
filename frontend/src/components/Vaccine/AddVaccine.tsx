import { CiCirclePlus } from "react-icons/ci";
import { useState } from "react";
export default function AddVaccine () {
    const [isModalOpen , setIsModalOpen] = useState(false);
    const [formData , setFormData] = useState({
        Nom: '',
        Duree: '',
        Date_arrivee: '',
        Date_peremption: '',
        Description: ''
    });

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e) => {
        const { name , value } = e.target;
        setFormData({... formData, [name]: value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Données du vaccin vers le backend :' , formData);
        try {
            const response = await fetch('http://localhost:3000/api/vaccins' , {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.text();
                console.log('Vaccin ajouté: ', data);
                setFormData({
                    Nom: '',
                    Duree: '',
                    Date_arrivee: '',
                    Date_peremption: '',
                    Description: ''
                });
                handleCloseModal();
                window.location.reload();
            } else {
                console.error('Erreur lors de l’ajout de l’enfant' );
            }
        } catch (error) {
            console.error('Erreur réseau:' , error);
        }
    }

   

    return (
    <>  
        <div className="fixed top-0 w-full rounded-lg h-25 flex flex-row justify-around items-center p-4">
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-600">
                La liste des Vaccins
            </h1>
            <button
                onClick={handleOpenModal}
                className="w-[200px] bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-between gap-2"
            >
                Ajouter un vaccin
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
                                        <label className="block text-sm font-medium text-gray-700 text-left">Durée antigène :</label>
                                        <input
                                            type="text"
                                            name="Duree"
                                            value={formData.Duree}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 text-left">Date d'arrivée :</label>
                                        <input
                                            type="date"
                                            name="Date_arrivee"
                                            value={formData.Date_arrivee}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 text-left">Date de péremption :</label>
                                        <input
                                            type="date"
                                            name="Date_peremption"
                                            value={formData.Date_peremption}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 text-left">Nom :</label>
                                        <input
                                            type="text"
                                            name="Description"
                                            value={formData.Description}
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
    </>);
}