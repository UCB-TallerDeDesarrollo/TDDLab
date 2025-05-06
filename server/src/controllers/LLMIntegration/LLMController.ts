import express, { Request, Response } from "express";
import cors from "cors"; 
import { CallLLMService } from "../../modules/LLMIntegration/application/CallLLMService";

function buildPrompt(tddlog: any[], gitInfo: any[]): string {
  const validEntries = tddlog.filter(entry => entry.timestamp && entry.numPassedTests !== undefined);
  
  let prompt = `<|system|>
Eres un experto en TDD. Analiza este historial y evalúa si se siguieron las 3 etapas:
1. Prueba fallida (RED)
2. Código que pasa la prueba (GREEN)
3. Refactorización (REFACTOR)
</s>
<|user|>
Historial de pruebas:`;

  validEntries.forEach((entry, i) => {
    prompt += `\n${i+1}. ${entry.success ? "✅" : "❌"} ${new Date(entry.timestamp).toLocaleString()}`;
    prompt += ` - Pasadas: ${entry.numPassedTests}, Fallidas: ${entry.failedTests}`;
  });

  prompt += `\n\nCommits:`;
  gitInfo.filter(commit => commit.commitId).forEach(commit => {
    prompt += `\n- ${commit.commitName} (${commit.commitId.slice(0,7)})`;
    prompt += ` - ${new Date(commit.commitTimestamp).toLocaleString()}`;
  });

  prompt += `\n\n¿Se siguió correctamente el ciclo TDD? Explica en menos de 100 palabras.</s>`;
  prompt += `<|assistant|>`;

  return prompt;
}



const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post("/generate", async (req: Request, res: Response) => {
  const rawData = req.body;

  if (!rawData.tddlog || !rawData.gitInfo) {
    return res.status(400).json({ error: "tddlog and gitInfo are required in the JSON body." });
  }

  try {
    const prompt = buildPrompt(rawData.tddlog, rawData.gitInfo);
    const generatedText = await CallLLMService(prompt);

    return res.json({ generatedText });
  } catch (error) {
    console.error("Error generating text:", error);
    return res.status(500).json({ error: "Failed to generate text." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});