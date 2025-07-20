#!/bin/bash

# Script pour remplacer toutes les références à "http://localhost:3000/api" par buildApiUrl("/api")
# dans les fichiers TypeScript et JavaScript du frontend

FRONTEND_DIR="/home/herilala/Documents/web/react/CSB/frontend/src"
IMPORT_STATEMENT="import { buildApiUrl } from \"../config/api\";"
RELATIVE_IMPORT_STATEMENT="import { buildApiUrl } from \"../../config/api\";"
DEEP_RELATIVE_IMPORT_STATEMENT="import { buildApiUrl } from \"../../../config/api\";"

echo "Recherche des fichiers contenant des références à 'http://localhost:3000/api'..."

# Trouver tous les fichiers contenant la chaîne "http://localhost:3000/api"
FILES=$(grep -l "http://localhost:3000/api" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -r $FRONTEND_DIR)

echo "Fichiers trouvés:"
echo "$FILES"
echo ""

# Pour chaque fichier trouvé
for file in $FILES; do
  echo "Traitement du fichier: $file"
  
  # Vérifier si le fichier importe déjà buildApiUrl
  if grep -q "import.*buildApiUrl.*from.*config/api" "$file"; then
    echo "  - Import buildApiUrl déjà présent"
  else
    # Déterminer le bon chemin d'import en fonction de la profondeur du fichier
    depth=$(echo "$file" | tr -cd '/' | wc -c)
    depth=$((depth - $(echo "$FRONTEND_DIR" | tr -cd '/' | wc -c)))
    
    if [ $depth -eq 2 ]; then
      # Fichier au niveau src/components/*.tsx
      sed -i '1,10 s/^import/'"$IMPORT_STATEMENT"'\nimport/' "$file"
      echo "  - Ajout de l'import buildApiUrl (niveau 1)"
    elif [ $depth -eq 3 ]; then
      # Fichier au niveau src/components/xyz/*.tsx
      sed -i '1,10 s/^import/'"$RELATIVE_IMPORT_STATEMENT"'\nimport/' "$file"
      echo "  - Ajout de l'import buildApiUrl (niveau 2)"
    else
      # Fichier plus profond
      sed -i '1,10 s/^import/'"$DEEP_RELATIVE_IMPORT_STATEMENT"'\nimport/' "$file"
      echo "  - Ajout de l'import buildApiUrl (niveau 3+)"
    fi
  fi
  
  # Remplacer les URL codées en dur par buildApiUrl
  sed -i 's|"http://localhost:3000/api|buildApiUrl("/api|g' "$file"
  sed -i "s|'http://localhost:3000/api|buildApiUrl('/api|g" "$file"
  sed -i 's|`http://localhost:3000/api|buildApiUrl(`/api|g' "$file"
  
  echo "  - URLs remplacées"
done

echo ""
echo "Terminé ! Toutes les références à 'http://localhost:3000/api' ont été remplacées."
