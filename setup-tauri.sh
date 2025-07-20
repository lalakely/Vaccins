#!/bin/bash

# Script d'installation et de configuration de Tauri pour CSB Vaccins
echo "Configuration de Tauri pour CSB Vaccins..."

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "npm n'est pas installé. Veuillez installer Node.js et npm."
    exit 1
fi

# Installer les dépendances Tauri dans le projet principal
echo "Installation des dépendances Tauri dans le projet principal..."
npm install @tauri-apps/cli@latest

# Installer les dépendances Tauri dans le frontend
echo "Installation des dépendances Tauri dans le frontend..."
cd frontend
npm install @tauri-apps/api@latest
cd ..

# Vérifier si Rust est installé
if ! command -v rustc &> /dev/null; then
    echo "Rust n'est pas installé. Installation de Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "Rust est déjà installé."
fi

# Installer les dépendances système nécessaires pour Tauri
echo "Installation des dépendances système pour Tauri..."
if command -v apt-get &> /dev/null; then
    # Pour les systèmes basés sur Debian/Ubuntu
    sudo apt-get update
    sudo apt-get install -y libwebkit2gtk-4.0-dev \
        build-essential \
        curl \
        wget \
        libssl-dev \
        libgtk-3-dev \
        libayatana-appindicator3-dev \
        librsvg2-dev
elif command -v dnf &> /dev/null; then
    # Pour les systèmes basés sur Fedora
    sudo dnf install -y webkit2gtk3-devel \
        openssl-devel \
        curl \
        wget \
        libappindicator-gtk3-devel \
        librsvg2-devel
elif command -v pacman &> /dev/null; then
    # Pour les systèmes basés sur Arch
    sudo pacman -Syu --needed webkit2gtk \
        base-devel \
        curl \
        wget \
        openssl \
        gtk3 \
        libappindicator-gtk3 \
        librsvg
else
    echo "Impossible de détecter le gestionnaire de paquets. Veuillez installer manuellement les dépendances nécessaires pour Tauri."
fi

# Créer les icônes par défaut pour Tauri
echo "Création des icônes par défaut..."
mkdir -p src-tauri/icons
# Utiliser une icône par défaut si elle n'existe pas déjà
if [ ! -f src-tauri/icons/32x32.png ]; then
    echo "Création d'une icône par défaut 32x32..."
    # Commande pour créer une icône simple (nécessite ImageMagick)
    if command -v convert &> /dev/null; then
        convert -size 32x32 xc:transparent -fill blue -draw "circle 16,16 16,8" src-tauri/icons/32x32.png
    else
        echo "ImageMagick n'est pas installé. Veuillez créer manuellement les icônes dans src-tauri/icons/"
    fi
fi

if [ ! -f src-tauri/icons/128x128.png ]; then
    echo "Création d'une icône par défaut 128x128..."
    if command -v convert &> /dev/null; then
        convert -size 128x128 xc:transparent -fill blue -draw "circle 64,64 64,32" src-tauri/icons/128x128.png
    fi
fi

if [ ! -f src-tauri/icons/128x128@2x.png ]; then
    echo "Création d'une icône par défaut 128x128@2x..."
    if command -v convert &> /dev/null; then
        convert -size 256x256 xc:transparent -fill blue -draw "circle 128,128 128,64" src-tauri/icons/128x128@2x.png
    fi
fi

# Copier les icônes pour les autres formats si nécessaire
cp -f src-tauri/icons/128x128.png src-tauri/icons/icon.ico 2>/dev/null || true
cp -f src-tauri/icons/128x128.png src-tauri/icons/icon.icns 2>/dev/null || true

echo "Configuration terminée. Vous pouvez maintenant exécuter 'npm run tauri dev' pour lancer l'application."
