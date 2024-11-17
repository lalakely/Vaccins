import { useState } from "react";

export default function AddChild() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        Nom: '',
        Prenom: '',
        CODE: '',
        date_naissance: '',
        age_premier_contact: '',
        SEXE: '',
        NomMere: '',
        NomPere: '',
        Domicile: '',
        Fokotany: '',
        Hameau: '',
        Telephone: ''
    });

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Données envoyées vers le backend :', formData); // Affiche les données dans la console
        try {
            const response = await fetch('http://localhost:3000/api/enfants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                const data = await response.text();
                console.log('Enfant ajouté:', data);
                setFormData({
                    Nom: '',
                    Prenom: '',
                    CODE: '',
                    date_naissance: '',
                    age_premier_contact: '',
                    SEXE: '',
                    NomMere: '',
                    NomPere: '',
                    Domicile: '',
                    Fokotany: '',
                    Hameau: '',
                    Telephone: ''
                });
                handleCloseModal();
                window.location.reload();
            } else {
                console.error('Erreur lors de l’ajout de l’enfant');
            }
        } catch (error) {
            console.error('Erreur réseau :', error);
        }
    };
    
    

    return (
        <>
            <div>
                <button
                    onClick={handleOpenModal}
                    className=" w-[200px] bg-blue-500 text-white rounded hover:bg-blue-600" 
                >
                    Ajouter un enfant
                </button>
            </div>
            

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Ajouter un enfant</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-6">
                                {/* Partie gauche */}
                                <div className="flex-1 space-y-4 ">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nom:</label>
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
                                        <label className="block text-sm font-medium text-gray-700">Prénom:</label>
                                        <input
                                            type="text"
                                            name="Prenom"
                                            value={formData.Prenom}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">CODE:</label>
                                        <input
                                            type="number"
                                            name="CODE"
                                            value={formData.CODE}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date de naissance:</label>
                                        <input
                                            type="date"
                                            name="date_naissance"
                                            value={formData.date_naissance}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Sexe:</label>
                                        <select
                                            name="SEXE"
                                            value={formData.SEXE}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        >
                                            <option value="">Sélectionnez</option>
                                            <option value="M">Masculin</option>
                                            <option value="F">Féminin</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Partie droite */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nom de la mère:</label>
                                        <input
                                            type="text"
                                            name="NomMere"
                                            value={formData.NomMere}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nom du père:</label>
                                        <input
                                            type="text"
                                            name="NomPere"
                                            value={formData.NomPere}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Domicile:</label>
                                        <input
                                            type="text"
                                            name="Domicile"
                                            value={formData.Domicile}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fokotany:</label>
                                        <input
                                            type="text"
                                            name="Fokotany"
                                            value={formData.Fokotany}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Hameau:</label>
                                        <input
                                            type="text"
                                            name="Hameau"
                                            value={formData.Hameau}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Téléphone:</label>
                                        <input
                                            type="text"
                                            name="Telephone"
                                            value={formData.Telephone}
                                            onChange={handleChange}
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
