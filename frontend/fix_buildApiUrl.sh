#!/bin/bash

# Chemin du fichier à corriger
FILE="/home/herilala/Documents/web/react/CSB/frontend/src/components/Child/ChildVaccinations.tsx"

# 1. Corriger les appels avec parenthèse fermante manquante
sed -i 's/buildApiUrl(\([^)]*\));/buildApiUrl(\1));/g' "$FILE"

# 2. Corriger les appels avec options fetch dans buildApiUrl
sed -i 's/buildApiUrl(\([^)]*\),\s*{/buildApiUrl(\1), {/g' "$FILE"
sed -i 's/buildApiUrl(\([^)]*\)),\s*{/buildApiUrl(\1)), {/g' "$FILE"

# 3. Corriger les appels avec options fetch dans buildApiUrl (multi-lignes)
perl -i -pe 'BEGIN{undef $/;} s/buildApiUrl\(([^,\)]+),\s*\{\s*([^}]+)\s*}\s*\);/buildApiUrl\(\1\), {\n          \2\n        });/gs' "$FILE"

echo "Corrections terminées"
