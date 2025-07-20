# CSB Vaccins - Application de Bureau avec Tauri

Cette documentation explique comment utiliser l'application CSB Vaccins en tant qu'application de bureau grâce à Tauri.

## Présentation

L'application CSB Vaccins a été transformée en application de bureau en utilisant Tauri, un framework qui permet de créer des applications de bureau multiplateformes à partir d'applications web. Cette intégration permet d'exécuter à la fois le backend Express.js et le frontend React dans une seule application de bureau, sans avoir besoin de démarrer manuellement les serveurs.

## Prérequis

- [Node.js](https://nodejs.org/) (v14 ou supérieur)
- [Rust](https://www.rust-lang.org/tools/install) (nécessaire pour Tauri)
- Dépendances système pour Tauri (installées automatiquement par le script de configuration)

## Installation

1. Exécutez le script de configuration pour installer toutes les dépendances nécessaires :

```bash
./setup-tauri.sh
```

Ce script va :
- Installer les dépendances Tauri dans le projet principal et le frontend
- Vérifier et installer Rust si nécessaire
- Installer les dépendances système requises pour Tauri
- Créer les icônes par défaut pour l'application

2. Installez les dépendances du projet :

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

## Développement

Pour lancer l'application en mode développement :

```bash
npm run tauri:dev
```

Cette commande va :
1. Démarrer le serveur de développement frontend (Vite)
2. Démarrer le backend Express.js dans un thread séparé
3. Lancer l'application Tauri qui se connectera au serveur de développement

## Construction de l'application

Pour construire l'application de bureau :

```bash
npm run tauri:build
```

Cette commande va générer des exécutables pour votre système d'exploitation dans le dossier `src-tauri/target/release/bundle/`.

## Fonctionnement

L'application Tauri CSB Vaccins fonctionne de la manière suivante :

1. Au démarrage, Tauri lance automatiquement le serveur backend Express.js dans un thread séparé.
2. Le frontend React se connecte au backend en utilisant l'adresse `localhost:3000`.
3. La configuration API a été adaptée pour détecter automatiquement si l'application s'exécute dans Tauri et utiliser la bonne URL pour se connecter au backend.

## Adaptation pour Tauri

Les modifications suivantes ont été apportées pour adapter l'application à Tauri :

1. **Configuration du backend** : Le serveur backend est démarré automatiquement par Tauri lors du lancement de l'application.

2. **Configuration API** : Le fichier `frontend/src/config/api.ts` a été modifié pour détecter si l'application s'exécute dans Tauri et utiliser l'adresse `localhost:3000` pour se connecter au backend.

3. **Configuration Vite** : Le fichier `frontend/vite.config.ts` a été modifié pour optimiser la compilation et le développement avec Tauri.

4. **Configuration Tauri** : Le fichier `src-tauri/tauri.conf.json` a été configuré pour permettre la communication entre le frontend et le backend.

## Dépannage

- **Le backend ne démarre pas** : Vérifiez les logs de l'application pour voir s'il y a des erreurs lors du démarrage du backend.
- **Le frontend ne se connecte pas au backend** : Assurez-vous que le port 3000 est disponible et que le backend est bien démarré.
- **Erreurs de compilation Rust** : Assurez-vous que Rust est correctement installé et à jour.

## Ressources supplémentaires

- [Documentation Tauri](https://tauri.app/v1/guides/)
- [Documentation Vite](https://vitejs.dev/guide/)
- [Documentation Express.js](https://expressjs.com/fr/)
