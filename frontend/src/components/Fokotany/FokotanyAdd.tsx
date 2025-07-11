import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaMapMarkerAlt, FaBuilding } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formStyles } from "@/components/ui/form-styles";

export default function FokotanyAdd() {
    const [formData, setFormData] = useState({
        Nom: '',
        px: '',
        py: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/fokotany', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSuccessMessage("Fokotany ajouté avec succès");
                setFormData({ Nom: '', px: '', py: '' });
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                setErrorMessage("Erreur lors de l'ajout du fokotany");
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            setErrorMessage("Une erreur réseau est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800 flex items-center gap-2">
                <FaBuilding className="text-gray-600" /> La liste des fokotany
            </h1>

            <Dialog>
                <DialogTrigger asChild>
                    <Button className={formStyles.primaryButton}>
                        Ajouter un fokotany <CiCirclePlus className="text-xl" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white p-4 sm:p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto border border-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FaBuilding className="text-gray-600" /> Ajouter un fokotany
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaBuilding className="text-gray-500" /> Nom du fokotany
                                </Label>
                                <div className={formStyles.inputWrapper}>
                                    <Input 
                                        type="text" 
                                        name="Nom" 
                                        value={formData.Nom} 
                                        onChange={handleChange} 
                                        className={formStyles.input}
                                        placeholder="Entrez le nom du fokotany"
                                        required 
                                    />
                                    <span className={formStyles.inputIcon}>
                                        <FaBuilding />
                                    </span>
                                </div>
                            </div>

                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaMapMarkerAlt className="text-gray-500" /> Coordonnée X
                                </Label>
                                <div className={formStyles.inputWrapper}>
                                    <Input 
                                        type="text" 
                                        name="px" 
                                        value={formData.px} 
                                        onChange={handleChange} 
                                        className={formStyles.input}
                                        placeholder="Entrez la coordonnée X"
                                        required 
                                    />
                                    <span className={formStyles.inputIcon}>
                                        <FaMapMarkerAlt />
                                    </span>
                                </div>
                            </div>

                            <div className={formStyles.formGroup}>
                                <Label className={formStyles.label}>
                                    <FaMapMarkerAlt className="text-gray-500" /> Coordonnée Y
                                </Label>
                                <div className={formStyles.inputWrapper}>
                                    <Input 
                                        type="text" 
                                        name="py" 
                                        value={formData.py} 
                                        onChange={handleChange} 
                                        className={formStyles.input}
                                        placeholder="Entrez la coordonnée Y"
                                        required 
                                    />
                                    <span className={formStyles.inputIcon}>
                                        <FaMapMarkerAlt />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <Button 
                                type="submit" 
                                disabled={loading} 
                                className={formStyles.successButton}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enregistrement...
                                    </>
                                ) : (
                                    "Enregistrer"
                                )}
                            </Button>
                        </div>
                        
                        {errorMessage && (
                            <div className={formStyles.errorContainer + " mt-4"}>
                                {errorMessage}
                            </div>
                        )}
                        
                        {successMessage && (
                            <div className={formStyles.successContainer + " mt-4"}>
                                {successMessage}
                            </div>
                        )}
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
