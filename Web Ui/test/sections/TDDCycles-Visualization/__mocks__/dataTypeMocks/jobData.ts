import { JobDataObject } from "../../../../../src/modules/TDDCycles-Visualization/domain/jobInterfaces";

export const mockSuccessJobData: JobDataObject = {
  sha: "123321456",
  conclusion: "success",
};

export const mockFailedJobData: JobDataObject = {
  sha: "1233214565",
  conclusion: "failure",
};

export const mockArrayJobData: JobDataObject[] = [
  { sha: "dd4ca82ccf990f55ecc1ea94c75d114ea05a39ff", conclusion: "success" },
  { sha: "bec3c0a1d89bda290f1a4adb9fde359654ce2401", conclusion: "success" },
  { sha: "cad139e281dd7a0e983a217329cc6f307ec00fa6", conclusion: "success" },
  { sha: "6e449e2b853254ff52a789fb024dc0972c114618", conclusion: "success" },
  { sha: "5ff717ba257ac052b45af77a6aadca2f6eadbab5", conclusion: "success" },
  { sha: "7fe269f057942086fb1e8698d09f4e1100f1c5ff", conclusion: "success" },
  { sha: "525f18f86f03e78277e2d0355b4cde7f14933642", conclusion: "success" },
  { sha: "bad4bac7433175ff06c083930599e96f46eafcde", conclusion: "failure" },
  { sha: "e56e226490ed47f3129a64d8de885772e9995a9f", conclusion: "success" },
  { sha: "61e250cc1547cd606b332ee24868590ee9cae921", conclusion: "failure" },
  { sha: "ff6e951d91e192983c9ac355cad46c1eb95e009f", conclusion: "failure" },
  { sha: "0d1e0964873fbd9db2898ef06e5bed128078c876", conclusion: "failure" },
  { sha: "1be662eab8f1c21debcefdd26a85a7c253d8a7ed", conclusion: "failure" },
  { sha: "6a8ce88a12b9566605ba5af835f696c4ee9d3dec", conclusion: "failure" },
  { sha: "7e19c19f4eecac0173b227badbd56fcb4fed8c54", conclusion: "failure" },
  { sha: "c1109ba1e9227dadf15d63d94115f8050935cbca", conclusion: "failure" },
  { sha: "40b54f8f8e2239e243ed08a760b180677d49b77f", conclusion: "failure" },
  { sha: "53116f1f7e2dd4d5f27d44d779da7afb6c18b6c8", conclusion: "success" },
  { sha: "b1993d41bddae96ea46febb47dab5037f4b4e7cd", conclusion: "failure" },
];
