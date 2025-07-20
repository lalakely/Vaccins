#!/bin/bash

# Répertoire racine du projet
PROJECT_DIR="/home/herilala/Documents/web/react/CSB/frontend"

# Trouver tous les fichiers TypeScript/TSX qui contiennent buildApiUrl
echo "Recherche des fichiers contenant buildApiUrl..."
FILES=$(grep -l "buildApiUrl" --include="*.tsx" --include="*.ts" -r "$PROJECT_DIR/src")

echo "Fichiers trouvés: $(echo "$FILES" | wc -l)"

# Pour chaque fichier
for file in $FILES; do
  echo "Traitement du fichier: $file"
  
  # 1. Vérifier si l'import de buildApiUrl est présent, sinon l'ajouter
  if ! grep -q "import.*buildApiUrl.*from.*config/api" "$file"; then
    echo "  Ajout de l'import buildApiUrl..."
    sed -i '1s/^/import { buildApiUrl } from "..\/..\/config\/api";\n/' "$file"
  fi
  
  # 2. Corriger les appels avec options fetch dans buildApiUrl (cas simple)
  sed -i 's/buildApiUrl(\([^)]*\),\s*{/buildApiUrl(\1), {/g' "$file"
  
  # 3. Corriger les appels avec options fetch dans buildApiUrl (cas avec parenthèse fermante)
  sed -i 's/buildApiUrl(\([^)]*\)),\s*{/buildApiUrl(\1)), {/g' "$file"
  
  # 4. Corriger les appels avec parenthèse fermante manquante
  sed -i 's/buildApiUrl(\([^)]*\));/buildApiUrl(\1));/g' "$file"
  
  # 5. Corriger les appels avec options fetch dans buildApiUrl (multi-lignes)
  perl -i -pe 'BEGIN{undef $/;} s/buildApiUrl\(([^,\)]+),\s*\{\s*([^}]+)\s*}\s*\);/buildApiUrl\(\1\), {\n          \2\n        });/gs' "$file"
  
  echo "  Corrections terminées pour $file"
done

echo "Toutes les corrections sont terminées!"
