import fs from 'fs';

const path = '.husky/state-semantic-commit';
const args = process.argv.slice(2);

if (args[0] === 'disabled' || args[0] === 'enable') {
  const newState = args[0];
  try {
    fs.writeFileSync(path, `${newState}\n`);
    console.log(`Archivo state-commit actualizado: state="${newState}"`);
  } catch (err) {
    console.error('Error al actualizar el archivo state-commit:', err);
  }
} else {
  console.log('Solo se acepta el estado de enable o disabled');
}
