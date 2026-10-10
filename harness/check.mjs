import { execSync } from "node:child_process";

// 1. Componente que queremos revisar.
const component = process.argv[2];

// 2. Información básica de cada componente.
const components = {
  web: {
    name: "Web Ui",
    folder: "Web Ui",
    test: "npm test",
  },

  server: {
    name: "server",
    folder: "server",
    test: "npm test",
  },

  extension: {
    name: "VSCodeExtension",
    folder: "VSCodeExtension",
    test: null,
  },
};

// 3. Verificar que el componente exista.
if (!components[component]) {
  console.log(`
Componente no válido.

Usa:
node harness/check.mjs web
node harness/check.mjs server
node harness/check.mjs extension
`);

  process.exit(1);
}

const selected = components[component];

// 4. Ejecutar los tests.
let testResult = "NO CONFIGURADO";

if (selected.test) {
  try {
    execSync(selected.test, {
      cwd: selected.folder,
      stdio: "ignore",
    });

    testResult = "PASS ✅";
  } catch {
    testResult = "FAIL ❌";
  }
}

// 5. Consultar qué archivos fueron modificados.
let modifiedFiles = "Ninguno.";

try {
  const result = execSync("git status --short", {
    encoding: "utf8",
  }).trim();

  if (result) {
    modifiedFiles = result;
  }
} catch {
  modifiedFiles = "No se pudo consultar Git.";
}

// 6. Mostrar el resultado.
console.log(`
================================
        TDDLab Harness
================================

Componente:
${selected.name}

Tests:
${testResult}

Archivos modificados:
${modifiedFiles}

================================
`);
