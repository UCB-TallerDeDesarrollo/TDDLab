import { CodeAnalysis, AnalysisResult } from "../domain/analysis";

export interface IAiService {
  analyzeCode(analysis: CodeAnalysis): Promise<AnalysisResult>;
}