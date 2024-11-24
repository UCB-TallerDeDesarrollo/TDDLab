export interface JobDataObject {
  sha: string;
  conclusion: string;
  ciclomaticComplexity: number;
  file?:string;
  functionName:string;
}