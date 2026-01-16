#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
fi

MAPPINGS=(
  "App.tsx:apps/web-client/App.tsx"
  "App.test.tsx:apps/web-client/App.test.tsx"
  "index.tsx:apps/web-client/index.tsx"
  "index.html:apps/web-client/index.html"
  "index.css:apps/web-client/index.css"
  "public:apps/web-client/public"
  "components:apps/web-client/components"
  "hooks:apps/web-client/hooks"
  "backend:services/school-service/legacy-backend"
  "database:services/school-service/database"
)

echo "Dry run: $DRY_RUN"
for m in "${MAPPINGS[@]}"; do
  SRC="${m%%:*}"
  DST="${m##*:}"
  if [ ! -e "$SRC" ]; then
    echo "Skipping: source not found -> $SRC"
    continue
  fi
  if [ $DRY_RUN -eq 1 ]; then
    echo "DRY RUN: git mv $SRC $DST"
  else
    mkdir -p "$(dirname "$DST")"
    git mv "$SRC" "$DST" || {
      # fallback: copy then remove
      cp -a "$SRC" "$DST"
      rm -rf "$SRC"
    }
    echo "Moved: $SRC -> $DST"
  fi
done

if [ $DRY_RUN -eq 0 ]; then
  git add -A
  git commit -m "chore: migrate files into polyrepo layout"
  echo "Committed migration. Review changes and open a PR."
fi
