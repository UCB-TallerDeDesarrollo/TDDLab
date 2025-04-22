import { CodeAnalysis, AnalysisResult } from "../domain/analysis";
import { IAiService } from "../ports/IAiServivice";

export class AnalysisService {
  constructor(private aiService: IAiService) {}

  async analyzeCode(analysis: CodeAnalysis): Promise<AnalysisResult> {
    if (!analysis.code) {
      throw new Error("El código es requerido");
    }
    
    return this.aiService.analyzeCode(analysis);
  }
}