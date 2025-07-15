import { cn } from "@/lib/utils";

// Styles globaux pour les formulaires
export const formStyles = {
  // Conteneurs
  card: "bg-white shadow-lg rounded-xl border border-gray-100 transition-all hover:shadow-xl",
  cardHeader: "bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl border-b border-gray-100 p-6",
  cardTitle: "text-2xl font-bold text-gray-800 text-center flex items-center justify-center gap-2",
  cardContent: "space-y-6 p-6",
  cardFooter: "flex flex-col space-y-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl border-t border-gray-100",
  
  // Champs de formulaire
  formGroup: "space-y-2",
  label: "text-sm font-medium text-gray-700 flex items-center gap-2",
  subLabel: "text-xs font-medium text-gray-600 block mb-1",
  inputWrapper: "relative group",
  input: "w-full pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-full transition-all duration-200 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 hover:border-gray-300 group-hover:border-gray-300",
  inputIcon: "absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-200",
  
  // Boutons
  primaryButton: "w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 active:from-gray-800 active:to-gray-900 transition-all duration-200 transform hover:-translate-y-1 rounded-full border border-gray-100 py-2.5 font-medium flex items-center justify-center gap-2",
  secondaryButton: "w-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 rounded-full border border-gray-100 py-2.5 font-medium flex items-center justify-center gap-2",
  dangerButton: "flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:bg-red-700 transition-all duration-200 transform hover:-translate-y-1 border border-red-100",
  successButton: "flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 transition-all duration-200 transform hover:-translate-y-1 border border-green-100 font-medium min-w-[120px]",
  
  // Validation
  inputValid: "border-green-300 focus:border-green-400 focus:ring-green-200",
  inputError: "border-red-300 focus:border-red-400 focus:ring-red-200",
  errorText: "text-red-600 text-xs mt-1 flex items-center gap-1",
  successText: "text-green-600 text-xs mt-1 flex items-center gap-1",
  
  // Messages d'alerte
  alertSuccess: "bg-green-50 border border-green-100 text-green-700 rounded-lg p-4 mb-4",
  alertError: "bg-red-50 border border-red-100 text-red-700 rounded-lg p-4 mb-4",
  errorContainer: "bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mt-4",
  successContainer: "bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mt-4",
  
  // Select et dropdown
  select: "w-full pl-10 bg-white border-gray-200 text-gray-900 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 hover:border-gray-300",
  selectTrigger: "w-full justify-between bg-white border-gray-200 hover:border-gray-400 text-gray-900 rounded-lg shadow-sm transition-all duration-200",
  selectContent: "bg-white border-gray-100 rounded-lg shadow-md overflow-hidden",
  selectItem: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer",
  
  // Popover
  popoverTrigger: "w-full justify-between bg-white border-gray-200 hover:border-gray-400 text-gray-900 rounded-lg shadow-sm transition-all duration-200",
  popoverContent: "bg-white border border-gray-100 rounded-lg shadow-md p-0",
  
  // Command
  commandInput: "border-gray-200 focus:border-gray-400 focus:ring-gray-200",
  commandEmpty: "py-6 text-center text-sm text-gray-500",
  commandItem: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer",
  
  // Divers
  divider: "border-t border-gray-100 my-4",
  link: "text-gray-600 hover:text-gray-800 hover:underline transition-colors",
};

// Fonction pour combiner les styles avec des classes personnalisées
export function getFormStyle(styleKey: keyof typeof formStyles, className?: string) {
  return cn(formStyles[styleKey], className);
}
