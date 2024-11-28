import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { spawn } from 'cross-spawn';

const COMMAND = 'jest';
const args = ['--json', '--outputFile=./script/report.json'];

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit' });
    process.on('close', (code) => {
      resolve();
    });
  });
}

const readJSONFile = (filePath) => {
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
};

const writeJSONFile = (filePath, data) => {
  const jsonString = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, jsonString, 'utf-8');
};

const ensureFileExists = (filePath, initialData) => {
  if (!fs.existsSync(filePath)) {
    writeJSONFile(filePath, initialData);
  }
};

const extractAndAddObject = async (reportFile, tddLogFile) => {
  try {
    await runCommand(COMMAND, args);

    ensureFileExists(tddLogFile, []);

    const jsonData = readJSONFile(reportFile);
    const passedTests = jsonData.numPassedTests;
    const totalTests = jsonData.numTotalTests;
    const startTime = jsonData.startTime;

    const newReport = {
      numPassedTests: passedTests,
      numTotalTests: totalTests,
      timestamp: startTime
    };

    const tddLog = readJSONFile(tddLogFile);
    tddLog.push(newReport);

    writeJSONFile(tddLogFile, tddLog);
    console.log("Tdd log has been updated");
  } catch (error) {
    console.error("Error en la ejecución:", error);
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilePath = path.join(__dirname, 'report.json');
const outputFilePath = path.join(__dirname, 'tdd_log.json');

extractAndAddObject(inputFilePath, outputFilePath);

export { extractAndAddObject };
