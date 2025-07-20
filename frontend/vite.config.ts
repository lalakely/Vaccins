import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuration pour le serveur de développement
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Permet d'accéder au serveur depuis d'autres appareils sur le réseau
    cors: true
  },
  // Configuration pour la compilation
  build: {
    // Génère les sourcemaps pour le débogage
    sourcemap: true,
    // Assure que les assets sont correctement référencés dans Tauri
    outDir: 'dist',
    // Optimisations pour Tauri
    target: 'esnext',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Assure que les chunks sont correctement chargés dans Tauri
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  // Définit les variables d'environnement disponibles dans le code client
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  },
})