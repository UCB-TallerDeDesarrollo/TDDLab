import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import { AnalyzeCode } from '../../modules/LlmAI/application/analyzeCode';
import LlmRepository from '../../modules/LlmAI/repository/LlmRepository';

const llmRepository = new LlmRepository();
const analyzeCodeUseCase = new AnalyzeCode(llmRepository);

const AIAssistantPage = () => {
  const location = useLocation();
  const repositoryLink = location.state?.repositoryLink || "No hay enlace disponible";

  const [analysisResponse, setAnalysisResponse] = useState<string>("");
  const [refactorResponse, setRefactorResponse] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [loadingRefactor, setLoadingRefactor] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleAnalyze = async () => {
    if (!repositoryLink || repositoryLink === "No hay enlace disponible") {
      setErrorMessage("No hay un enlace de repositorio válido para analizar");
      return;
    }

    setLoadingAnalysis(true);
    setErrorMessage("");

    try {
      const result = await analyzeCodeUseCase.execute(repositoryLink, "Analiza");
      setAnalysisResponse(result);
    } catch (error) {
      console.error("Error al analizar:", error);
      setErrorMessage("Error al comunicarse con el servidor");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleRefactor = async () => {
    if (!repositoryLink || repositoryLink === "No hay enlace disponible") {
      setErrorMessage("No hay un enlace de repositorio válido para refactorizar");
      return;
    }

    setLoadingRefactor(true);
    setErrorMessage("");

    try {
      const result = await analyzeCodeUseCase.execute(repositoryLink, "Refactoriza");
      setRefactorResponse(result);
    } catch (error) {
      console.error("Error al refactorizar:", error);
      setErrorMessage("Error al comunicarse con el servidor");
    } finally {
      setLoadingRefactor(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', paddingTop: '20px', padding: '0 20px' }}>
      {/* Título principal */}
      <Typography
        variant="h5"
        component="div"
        style={{ fontSize: "30px", lineHeight: "3.8", textAlign: 'center', marginBottom: '20px' }}
      >
        Asistente IA
      </Typography>

      {/* Subtítulo con el enlace */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
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

      {/* Mostrar mensaje de error si existe (oculto visualmente pero funcional) */}
      {errorMessage && (
        <Typography
          variant="body2"
          color="error"
          style={{ marginBottom: '0', height: '0', overflow: 'hidden' }}
        >
          {errorMessage}
        </Typography>
      )}

      {/* Recuadro con scroll para análisis */}
      <div
        style={{
          border: '2px solid #b0b0b0',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          width: '100%',
          maxWidth: '1200px',
          height: '400px',
          overflowY: 'scroll',
          overflowX: 'hidden',
          padding: '10px',
          marginBottom: '20px',
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          style={{ fontSize: "16px", lineHeight: "1.8", whiteSpace: 'pre-wrap' }}
        >
          {loadingAnalysis
            ? "Analizando..."
            : analysisResponse || "RESPUESTA DE LA IA - PROMPT ANALIZAR"}
        </Typography>
      </div>

      {/* Botón ANALIZAR */}
      <Button
        variant="contained"
        color="primary"
        style={{
          textTransform: 'none',
          fontSize: '15px',
          marginRight: '8px',
          marginBottom: '20px',
        }}
        onClick={handleAnalyze}
        disabled={loadingAnalysis || loadingRefactor}
      >
        Analizar
      </Button>

      {/* Recuadro con scroll para refactorización */}
      <div
        style={{
          border: '2px solid #b0b0b0',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          width: '100%',
          maxWidth: '1200px',
          height: '400px',
          overflowY: 'scroll',
          overflowX: 'hidden',
          padding: '10px',
          marginBottom: '20px',
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          style={{ fontSize: "16px", lineHeight: "1.8", whiteSpace: 'pre-wrap' }}
        >
          {loadingRefactor
            ? "Refactorizando..."
            : refactorResponse || "RESPUESTA DE LA IA - PROMPT REFACTORIZAR"}
        </Typography>
      </div>

      {/* Botón REFACTORIZAR */}
      <Button
        variant="contained"
        color="primary"
        style={{
          textTransform: 'none',
          fontSize: '15px',
          marginRight: '8px',
        }}
        onClick={handleRefactor}
        disabled={loadingAnalysis || loadingRefactor}
      >
        Refactorizar
      </Button>
    </div>
  );
};

export default AIAssistantPage;