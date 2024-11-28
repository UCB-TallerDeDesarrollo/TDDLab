import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const getCommitsFromPush = () => {
    try {
        const commits = execSync('git log origin/main..HEAD --pretty=format:"%H"').toString().trim();
        return commits ? commits.split('\n') : [];
    } catch (error) {
        console.error('Error obteniendo los commits del push:', error.message);
        return [];
    }
};

const generatePushId = () => {
    return 'push-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

const updateJsonFileWithPush = (pushId, commits) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, 'tdd_log.json');
    const pushTimestamp = Date.now();
    const pushData = {
        pushId,
        pushTimestamp,
        commits,
    };

    try {
        const fileData = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '[]';
        const existingData = JSON.parse(fileData);

        existingData.push(pushData);
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
        console.log('Push registrado exitosamente:', pushData);
    } catch (err) {
        console.error('Error actualizando el archivo JSON:', err.message);
    }
};

const commits = getCommitsFromPush();
if (commits.length > 0) {
    const pushId = generatePushId();
    updateJsonFileWithPush(pushId, commits);
} else {
    console.log('No se encontraron commits para el push.');
}
