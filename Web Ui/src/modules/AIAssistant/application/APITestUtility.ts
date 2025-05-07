import axios from "axios";
import { VITE_API } from "../../../../config";

/**
 * Utilidad para probar directamente los endpoints de la API
 * Puedes llamar a esta función desde la consola del navegador para depurar
 */
export const testAPIEndpoints = async () => {
  const API_URL = VITE_API + "/AIAssistant";
  
  console.log("Probando endpoints de la API...");
  console.log("URL base:", API_URL);
  
  try {
    // Probar el endpoint de prompts
    console.log("Intentando GET a", `${API_URL}/prompts`);
    const promptsResponse = await axios.get(`${API_URL}/prompts`);
    console.log("✅ GET /prompts - Status:", promptsResponse.status);
    console.log("Respuesta:", promptsResponse.data);
    
    // Comprobar la estructura de la respuesta
    console.log("Estructura de la respuesta:");
    console.log("Keys:", Object.keys(promptsResponse.data));
    
    // Intentar encontrar los prompts en diferentes lugares posibles
    if (promptsResponse.data.tddPrompt) {
      console.log("✅ tddPrompt encontrado directamente en la respuesta");
    } else if (promptsResponse.data.prompts && promptsResponse.data.prompts.tddPrompt) {
      console.log("✅ tddPrompt encontrado en data.prompts");
    } else {
      console.log("❌ No se pudo encontrar tddPrompt en la respuesta");
      console.log("Buscando propiedades similares...");
      
      // Buscar propiedades que contengan "tdd" o "TDD" en cualquier nivel
      const findPropertyByName = (obj: any, namePattern: RegExp): [string, any] | null => {
        if (!obj || typeof obj !== 'object') return null;
        
        for (const key in obj) {
          if (namePattern.test(key)) {
            return [key, obj[key]];
          }
          
          const result = findPropertyByName(obj[key], namePattern);
          if (result) return result;
        }
        
        return null;
      };
      
      const tddProperty = findPropertyByName(promptsResponse.data, /tdd|TDD/i);
      if (tddProperty) {
        console.log(`Encontrada propiedad similar: ${tddProperty[0]} = ${tddProperty[1]}`);
      }
      
      const refactoringProperty = findPropertyByName(promptsResponse.data, /refactor|Refactor/i);
      if (refactoringProperty) {
        console.log(`Encontrada propiedad similar: ${refactoringProperty[0]} = ${refactoringProperty[1]}`);
      }
    }
    
    return {
      success: true,
      data: promptsResponse.data
    };
  } catch (error: any) {
    console.error("❌ Error en la prueba de API:", error);
    console.log("Mensaje de error:", error.message);
    
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
    
    return {
      success: false,
      error: error
    };
  }
};

// Para usar en la consola del navegador
(window as any).testAPIEndpoints = testAPIEndpoints;