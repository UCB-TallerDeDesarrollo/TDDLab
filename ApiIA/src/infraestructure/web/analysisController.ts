import { Request, Response } from 'express';
import { AnalysisService } from "../../core/services/analysisService";
import { CodeAnalysis } from "../../core/domain/analysis";

export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  async analyzeCode(req: Request, res: Response) {
    try {
      const analysis: CodeAnalysis = req.body;
      const result = await this.analysisService.analyzeCode(analysis);
      res.json(result);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'Hubo un problema al generar la respuesta.',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}