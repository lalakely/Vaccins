import { useState } from "react";
import { buildApiUrl } from "../../config/api";
import {
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  HomeIcon,
  IdentificationIcon,
  UserGroupIcon,
  MapIcon,
  PencilIcon,
  CheckIcon,
  XCircleIcon,
  UserCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChildVaccinations from "./ChildVaccinations";

// Ajout d'une interface pour les props
interface Enfant {
  id: number;
  Nom: string;
  Prenom: string;
  CODE: string;
  date_naissance: string;
  age_premier_contact: number;
  SEXE: string;
  NomMere: string;
  NomPere: string;
  Domicile: string;
  Fokotany: string;
  Hameau: string;
  Telephone: string;
  // Ajoutez d'autres champs si nécessaire
}

interface ChildDetailsPopupProps {
  enfant: Enfant;
  onClose: () => void;
}

function ChildDetailsPopup({ enfant, onClose }: ChildDetailsPopupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...enfant });

  // Typage du paramètre e
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      // Convertir la date au format attendu (YYYY-MM-DD)
      const dateNaissance = new Date(formData.date_naissance).toISOString().split('T')[0];

      // Mettre à jour formData avec la date formatée
      const updatedFormData = { ...formData, date_naissance: dateNaissance };

      console.log("Données à envoyer avec la date formatée :", updatedFormData);

      const response = await fetch(buildApiUrl(`/api/enfants/${updatedFormData.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });

      const responseData = await response.json();
      console.log("Réponse du serveur :", response.status, responseData);

      if (response.ok) {
        console.log("Enfant mis à jour avec succès");
        setIsEditing(false);
        onClose();
        window.location.reload();
      } else {
        console.error("Erreur lors de la mise à jour de l’enfant :", responseData.message);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  };

  const handleCancel = () => {
    setFormData({ ...enfant });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet enfant ? Cette action est irréversible.")) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/enfants/${enfant.id}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "Erreur lors de la suppression");
      }

      console.log("Enfant supprimé avec succès");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la suppression de l’enfant :", error);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

  if (!enfant) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 overflow-y-auto">
      <div className="flex flex-col lg:flex-row w-full max-w-4xl gap-6 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {/* Section Détails */}
        <div className="relative bg-gray-50 p-4 sm:p-6 rounded-lg shadow-lg w-full lg:flex-1">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2 flex items-center gap-2">
            <UserCircleIcon className="h-7 w-7 text-gray-600" /> Détails de l'enfant
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-4">
            {/* Colonne 1 */}
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <IdentificationIcon className="h-5 w-5 text-gray-600" /> ID
                </Label>
                <p className="text-gray-900 text-base font-semibold">{enfant.id}</p>
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-600" /> Nom
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="Nom"
                    value={formData.Nom}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">{enfant.Nom}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-600" /> Prénom
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="Prenom"
                    value={formData.Prenom}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">{enfant.Prenom}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <IdentificationIcon className="h-5 w-5 text-gray-600" /> Code
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="CODE"
                    value={formData.CODE}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">{enfant.CODE}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-600" /> Date de naissance
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    name="date_naissance"
                    value={new Date(formData.date_naissance).toISOString().split("T")[0]}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">
                    {new Date(enfant.date_naissance).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-gray-600" /> Âge au premier contact
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    name="age_premier_contact"
                    value={formData.age_premier_contact}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">{enfant.age_premier_contact}</p>
                )}
              </div>
            </div>

            {/* Colonne 2 */}
            <div className="space-y-4">
              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-600" /> Sexe
                </Label>
                {isEditing ? (
                  <Select
                    onValueChange={(value) => setFormData({ ...formData, SEXE: value })}
                    value={formData.SEXE}
                  >
                    <SelectTrigger className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm">
                      <SelectValue placeholder="Sélectionnez le sexe" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem
                        value="M"
                        className="text-black hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        Masculin
                      </SelectItem>
                      <SelectItem
                        value="F"
                        className="text-black hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        Féminin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-gray-900 text-base">
                    {enfant.SEXE === "M" ? "Masculin" : "Féminin"}
                  </p>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-600" /> Nom de la mère
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="NomMere"
                    value={formData.NomMere}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">{enfant.NomMere}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-600" /> Nom du père
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="NomPere"
                    value={formData.NomPere}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">{enfant.NomPere}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <HomeIcon className="h-5 w-5 text-gray-600" /> Domicile
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="Domicile"
                    value={formData.Domicile}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">{enfant.Domicile}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <MapIcon className="h-5 w-5 text-gray-600" /> Fokotany
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="Fokotany"
                    value={formData.Fokotany}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">{enfant.Fokotany}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <MapIcon className="h-5 w-5 text-gray-600" /> Hameau
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="Hameau"
                    value={formData.Hameau}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">{enfant.Hameau}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                <Label className="block text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5 text-gray-600" /> Téléphone
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="Telephone"
                    value={formData.Telephone}
                    onChange={handleChange}
                    className="bg-white text-black border-gray-300 hover:border-gray-500 w-full shadow-sm"
                  />
                ) : (
                  <p className="text-gray-900 text-base">{enfant.Telephone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md"
                >
                  <CheckIcon className="h-5 w-5" /> Enregistrer
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md"
                >
                  <XCircleIcon className="h-5 w-5" /> Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                >
                  <PencilIcon className="h-5 w-5" /> Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md rounded-full"
                >
                  <TrashIcon className="h-5 w-5" /> Supprimer
                </button>
              </>
            )}
          </div>
        </div>

        {/* Section ChildVaccinations */}
        <div className="w-full lg:flex-1">
          <ChildVaccinations enfantId={enfant.id.toString()} />
        </div>
      </div>
    </div>
  );
}

export default ChildDetailsPopup;