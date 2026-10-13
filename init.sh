#!/usr/bin/env bash
# Validación de lectura del entorno de frontend; no instala ni modifica archivos.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

for tool in git node npm; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf 'Falta %s. Instálalo y vuelve a ejecutar bash init.sh.\n' "$tool" >&2
    exit 1
  fi
done

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf 'Ejecuta este script desde una copia Git de TDDLab.\n' >&2
  exit 1
fi

if [[ ! -f 'Web Ui/package.json' || ! -f 'server/package.json' ]]; then
  printf 'No se encontró la estructura esperada de TDDLab.\n' >&2
  exit 1
fi

for entry in 'jest/bin/jest.js' 'typescript/bin/tsc'; do
  if [[ ! -f "Web Ui/node_modules/$entry" ]]; then
    printf 'Faltan dependencias del frontend. Ejecuta npm ci dentro de Web Ui.\n' >&2
    exit 1
  fi
done

printf 'Rama: '
git branch --show-current
printf 'Node: '
node --version
printf 'npm: '
npm --version
node 'Web Ui/node_modules/jest/bin/jest.js' --version
node 'Web Ui/node_modules/typescript/bin/tsc' --version
printf 'Entorno del frontend disponible. Las pruebas no se ejecutaron; consulta docs/README.md.\n'
