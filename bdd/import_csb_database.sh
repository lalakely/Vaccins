#!/bin/bash
# ============================================================================
# SCRIPT D'IMPORT DE LA BASE DE DONNÉES CSB SUR LE VPS
# ============================================================================
# Ce script importe la base de données sur le VPS.
# À exécuter sur le VPS après avoir transféré le fichier d'export.
#
# UTILISATION:
#   chmod +x import_csb_database.sh
#   ./import_csb_database.sh /chemin/vers/csb_full_dump.sql
#
# ============================================================================

# Configuration VPS - Modifiez ces valeurs
DB_HOST="localhost"
DB_USER="csb"
DB_PASSWORD="votre_mot_de_passe_vps"
DB_NAME="csb"

# Vérifier si un fichier a été fourni
if [ -z "$1" ]; then
    echo "❌ Erreur: Veuillez spécifier le fichier SQL à importer"
    echo "   Usage: $0 <fichier.sql>"
    exit 1
fi

SQL_FILE=$1

# Vérifier si le fichier existe
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur: Le fichier '$SQL_FILE' n'existe pas"
    exit 1
fi

echo "🚀 Import de la base de données CSB"
echo "====================================="
echo "Fichier: $SQL_FILE"
echo ""

# Créer la base de données si elle n'existe pas
echo "📋 Création de la base de données..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la création de la base de données"
    exit 1
fi

# Importer le fichier SQL
echo "📊 Import des données..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < $SQL_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo "====================================="
    echo "✅ Import terminé avec succès !"
    echo ""
    echo "Vérification des tables:"
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SHOW TABLES;"
    echo ""
    echo "Comptage des enregistrements:"
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "
        USE $DB_NAME;
        SELECT 'users' AS table_name, COUNT(*) AS count FROM users
        UNION SELECT 'Fokotany', COUNT(*) FROM Fokotany
        UNION SELECT 'Hameau', COUNT(*) FROM Hameau
        UNION SELECT 'Enfants', COUNT(*) FROM Enfants
        UNION SELECT 'Vaccins', COUNT(*) FROM Vaccins
        UNION SELECT 'Vaccinations', COUNT(*) FROM Vaccinations;
    "
    echo "====================================="
else
    echo "❌ Erreur lors de l'import"
    exit 1
fi
