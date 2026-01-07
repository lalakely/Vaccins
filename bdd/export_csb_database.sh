#!/bin/bash
# ============================================================================
# SCRIPT D'EXPORT DE LA BASE DE DONNÉES CSB
# ============================================================================
# Ce script exporte la structure ET les données de votre base de données locale
# pour les transférer vers le VPS.
#
# UTILISATION:
#   chmod +x export_csb_database.sh
#   ./export_csb_database.sh
#
# ============================================================================

# Configuration - Modifiez ces valeurs selon votre environnement local
DB_HOST="localhost"
DB_USER="csb"
DB_PASSWORD="12345678"
DB_NAME="csb"

# Fichiers de sortie
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SCHEMA_FILE="csb_schema_${TIMESTAMP}.sql"
DATA_FILE="csb_data_${TIMESTAMP}.sql"
FULL_DUMP="csb_full_dump_${TIMESTAMP}.sql"

echo "🚀 Export de la base de données CSB"
echo "====================================="
echo ""

# 1. Export de la structure uniquement (sans données)
echo "📋 Export de la structure..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD \
    --no-data \
    --routines \
    --triggers \
    --events \
    --skip-comments \
    $DB_NAME > $SCHEMA_FILE

if [ $? -eq 0 ]; then
    echo "✅ Structure exportée vers: $SCHEMA_FILE"
else
    echo "❌ Erreur lors de l'export de la structure"
    exit 1
fi

# 2. Export des données uniquement
echo "📊 Export des données..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD \
    --no-create-info \
    --skip-triggers \
    --complete-insert \
    --skip-comments \
    $DB_NAME > $DATA_FILE

if [ $? -eq 0 ]; then
    echo "✅ Données exportées vers: $DATA_FILE"
else
    echo "❌ Erreur lors de l'export des données"
    exit 1
fi

# 3. Export complet (structure + données)
echo "📦 Export complet..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD \
    --routines \
    --triggers \
    --events \
    --complete-insert \
    --skip-comments \
    $DB_NAME > $FULL_DUMP

if [ $? -eq 0 ]; then
    echo "✅ Export complet vers: $FULL_DUMP"
else
    echo "❌ Erreur lors de l'export complet"
    exit 1
fi

echo ""
echo "====================================="
echo "✅ Export terminé avec succès !"
echo ""
echo "Fichiers créés:"
echo "  📋 Structure: $SCHEMA_FILE"
echo "  📊 Données:   $DATA_FILE"
echo "  📦 Complet:   $FULL_DUMP"
echo ""
echo "Pour transférer vers le VPS:"
echo "  scp $FULL_DUMP user@votre-vps:/tmp/"
echo ""
echo "Pour importer sur le VPS:"
echo "  mysql -u csb -p csb < /tmp/$FULL_DUMP"
echo "====================================="
