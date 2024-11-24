import { JobDataObject } from "../../../../../src/modules/TDDCycles-Visualization/domain/jobInterfaces";

export const mockSuccessJobData: JobDataObject = {
  sha: "123321456",
  conclusion: "success",
  ciclomaticComplexity: 1,
  functionName: "testFunction",
  file: "test.ts"
};

export const mockFailedJobData: JobDataObject = {
  sha: "1233214565",
  conclusion: "failure",
  ciclomaticComplexity: 2,
  functionName: "failedFunction",
  file: "failed.ts"
};

export const mockArrayJobData: JobDataObject[] = [
  { sha: "dd4ca82ccf990f55ecc1ea94c75d114ea05a39ff", conclusion: "success", ciclomaticComplexity: 1, functionName: "function1", file: "file1.ts" },
  { sha: "bec3c0a1d89bda290f1a4adb9fde359654ce2401", conclusion: "success", ciclomaticComplexity: 2, functionName: "function2", file: "file2.ts" },
  { sha: "cad139e281dd7a0e983a217329cc6f307ec00fa6", conclusion: "success", ciclomaticComplexity: 3, functionName: "function3", file: "file3.ts" },
  { sha: "6e449e2b853254ff52a789fb024dc0972c114618", conclusion: "success", ciclomaticComplexity: 1, functionName: "function4", file: "file4.ts" },
  { sha: "5ff717ba257ac052b45af77a6aadca2f6eadbab5", conclusion: "success", ciclomaticComplexity: 2, functionName: "function5", file: "file5.ts" },
  { sha: "7fe269f057942086fb1e8698d09f4e1100f1c5ff", conclusion: "success", ciclomaticComplexity: 3, functionName: "function6", file: "file6.ts" },
  { sha: "525f18f86f03e78277e2d0355b4cde7f14933642", conclusion: "success", ciclomaticComplexity: 1, functionName: "function7", file: "file7.ts" },
  { sha: "bad4bac7433175ff06c083930599e96f46eafcde", conclusion: "failure", ciclomaticComplexity: 4, functionName: "function8", file: "file8.ts" },
  { sha: "e56e226490ed47f3129a64d8de885772e9995a9f", conclusion: "success", ciclomaticComplexity: 2, functionName: "function9", file: "file9.ts" },
  { sha: "61e250cc1547cd606b332ee24868590ee9cae921", conclusion: "failure", ciclomaticComplexity: 5, functionName: "function10", file: "file10.ts" },
  { sha: "ff6e951d91e192983c9ac355cad46c1eb95e009f", conclusion: "failure", ciclomaticComplexity: 3, functionName: "function11", file: "file11.ts" },
  { sha: "0d1e0964873fbd9db2898ef06e5bed128078c876", conclusion: "failure", ciclomaticComplexity: 4, functionName: "function12", file: "file12.ts" },
  { sha: "1be662eab8f1c21debcefdd26a85a7c253d8a7ed", conclusion: "failure", ciclomaticComplexity: 2, functionName: "function13", file: "file13.ts" },
  { sha: "6a8ce88a12b9566605ba5af835f696c4ee9d3dec", conclusion: "failure", ciclomaticComplexity: 3, functionName: "function14", file: "file14.ts" },
  { sha: "7e19c19f4eecac0173b227badbd56fcb4fed8c54", conclusion: "failure", ciclomaticComplexity: 4, functionName: "function15", file: "file15.ts" },
  { sha: "c1109ba1e9227dadf15d63d94115f8050935cbca", conclusion: "failure", ciclomaticComplexity: 2, functionName: "function16", file: "file16.ts" },
  { sha: "40b54f8f8e2239e243ed08a760b180677d49b77f", conclusion: "failure", ciclomaticComplexity: 3, functionName: "function17", file: "file17.ts" },
  { sha: "53116f1f7e2dd4d5f27d44d779da7afb6c18b6c8", conclusion: "success", ciclomaticComplexity: 1, functionName: "function18", file: "file18.ts" },
  { sha: "b1993d41bddae96ea46febb47dab5037f4b4e7cd", conclusion: "failure", ciclomaticComplexity: 4, functionName: "function19", file: "file19.ts" },
];