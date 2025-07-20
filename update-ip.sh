#!/bin/bash

# Obtenir l'adresse IP principale
IP=$(hostname -I | awk '{print $1}')

# Mettre à jour le fichier de configuration
sed -i "s/export const SERVER_IP = '.*';/export const SERVER_IP = '$IP';/" ./frontend/src/config/api.ts

echo "Adresse IP mise à jour : $IP"
echo "Le fichier de configuration a été mis à jour."

# Démarrer le backend
cd backend
node server.js &
BACKEND_PID=$!

# Attendre que le backend démarre
sleep 2

# Démarrer le frontend
cd ../frontend
npm start

# Nettoyer à la sortie
trap "kill $BACKEND_PID" EXIT
