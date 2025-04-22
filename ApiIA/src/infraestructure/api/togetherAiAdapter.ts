import axios from 'axios';
import { CodeAnalysis, AnalysisResult } from "../../core/domain/analysis";
import { IAiService } from "../../core/ports/IAiServivice";

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
const MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export class TogetherAiAdapter implements IAiService {
  constructor(private apiKey: string) {}

  async analyzeCode(analysis: CodeAnalysis): Promise<AnalysisResult> {
    const userContent = analysis.instruction 
      ? `${analysis.instruction}\n\n${analysis.code}` 
      : `Analiza el siguiente código:\n\n${analysis.code}`;

    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: 'Eres un experto en desarrollo de software.' },
          { role: 'user', content: userContent }
        ],
        temperature: 0.2,
        max_tokens: 1024
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      result: response.data.choices[0].message.content
    };
  }
}