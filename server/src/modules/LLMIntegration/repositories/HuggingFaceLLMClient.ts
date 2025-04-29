import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_MODEL = "HuggingFaceH4/zephyr-7b-beta";
const HF_API_KEY = process.env.HF_API_KEY as string;

if (!HF_API_KEY) {
  throw new Error("HF_API_KEY no está definida en el archivo .env");
}

export async function callHuggingFaceModel(
  prompt: string,
  modelId?: string
): Promise<string> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 15000;
  const model = modelId || DEFAULT_MODEL;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt} con modelo ${model}`);
      
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false,
            top_p: 0.9,
            do_sample: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("🔍 Respuesta completa:", response.data);

      if (Array.isArray(response.data)) {
        return response.data[0]?.generated_text || "No response (array format)";
      } else if (typeof response.data === 'object') {
        return response.data.generated_text || "No response (object format)";
      }

      return "No response (unexpected format)";
      
    } catch (error: any) {
      console.error(`⚠️ Error en intento ${attempt}:`, error.response?.data || error.message);
      
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Esperando ${RETRY_DELAY/1000} segundos antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
      }
    }
  }

  return "No response after retries";
}