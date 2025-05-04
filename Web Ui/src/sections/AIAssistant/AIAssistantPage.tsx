import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';
import AIResultSection from './components/AIResultSection';
import { EvaluateWithAI } from '../../modules/AIAssistant/application/EvaluateWithAI';

const evaluateWithAIUseCase = new EvaluateWithAI();

const AIAssistantPage = () => {
  const location = useLocation();
  const repositoryLink = location.state?.repositoryLink || "No hay enlace disponible";

  const [analysisResponse, setAnalysisResponse] = useState<string>("");
  const [refactorResponse, setRefactorResponse] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [loadingRefactor, setLoadingRefactor] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleApiCall = async (
    action: "Evaluar la aplicación de TDD" | "Evaluar la aplicación de Refactoring",
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setResponse: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!repositoryLink || repositoryLink === "No hay enlace disponible") {
      setErrorMessage(`No hay un enlace de repositorio válido para ${action.toLowerCase()}`);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const result = await evaluateWithAIUseCase.execute(repositoryLink, action);
      setResponse(result);
    } catch (error) {
      console.error(`Error al ${action.toLowerCase()}:`, error);
      setErrorMessage("Error al comunicarse con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '90vh', padding: '0 20px' }}>
      <Typography
        variant="h5"
        component="div"
        style={{ fontSize: "30px", lineHeight: "1.5", textAlign: 'center', marginBottom: '10px' }}
      >
        Asistente IA
      </Typography>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          style={{ fontSize: "16px", lineHeight: "1.8" }}
        >
          <strong style={{ marginRight: '8px' }}>Enlace:</strong>
          <a
            href={repositoryLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            {repositoryLink}
          </a>
        </Typography>
      </div>

      {errorMessage && (
        <Typography
          variant="body2"
          color="error"
          style={{ marginBottom: '10px' }}
        >
          {errorMessage}
        </Typography>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', gap: '40px' }}>
        <AIResultSection
          title="Procesando..."
          response={analysisResponse}
          loading={loadingAnalysis}
          onAction={() => handleApiCall("Evaluar la aplicación de TDD", setLoadingAnalysis, setAnalysisResponse)}
          buttonText="Evaluar la aplicación de TDD"
        />
        <AIResultSection
          title="Procesando..."
          response={refactorResponse}
          loading={loadingRefactor}
          onAction={() => handleApiCall("Evaluar la aplicación de Refactoring", setLoadingRefactor, setRefactorResponse)}
          buttonText="Evaluar la aplicación de Refactoring"
        />
      </div>
    </div>
  );
};

export default AIAssistantPage;