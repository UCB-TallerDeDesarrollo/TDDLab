import express from 'express';
import dotenv from 'dotenv';
import { AnalysisController } from "../infraestructure/web/analysisController"
import { AnalysisService } from "../core/services/analysisService";
import { TogetherAiAdapter } from "../infraestructure/api/togetherAiAdapter";

dotenv.config();

export class App {
  private expressApp: express.Application;

  constructor() {
    this.expressApp = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares() {
    this.expressApp.use(express.json());
  }

  private setupRoutes() {
    const aiAdapter = new TogetherAiAdapter(process.env.TOGETHER_API_KEY!);
    const analysisService = new AnalysisService(aiAdapter);
    const analysisController = new AnalysisController(analysisService);

    this.expressApp.post('/analyze', (req, res) => 
      analysisController.analyzeCode(req, res)
    );
  }

  start(port: number) {
    this.expressApp.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  }
}