import { JobDataObject } from "../../../../../src/modules/TDDCycles-Visualization/domain/jobInterfaces";

export const mockSuccessJobData: JobDataObject = {
  sha: "123321456",
  conclusion: "success"
};

export const mockFailedJobData: JobDataObject = {
  sha: "123321456",
  conclusion: "failure"
  };
  
  export const mockArrayJobData: JobDataObject[] = [{
    sha: "123321456",
    conclusion: "failure"
    }];