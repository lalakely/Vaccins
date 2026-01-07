/// <reference types="vite/client" />

// Déclaration des variables d'environnement personnalisées
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_API_PORT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
