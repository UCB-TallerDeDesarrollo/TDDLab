const { exec } = require('child_process');
const fs = require('fs');

const COMMAND = 'npm run test-export-json';

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
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

const extractAndAddObject = async (reportFile, tddLogFile) => {
  try {
    await runCommand(COMMAND);  

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
    console.error(error);
  }
};

const inputFilePath = __dirname.concat('/report.json');
const outputFilePath = __dirname.concat('/tdd_log.json');

extractAndAddObject(inputFilePath, outputFilePath);

module.exports = { extractAndAddObject };
