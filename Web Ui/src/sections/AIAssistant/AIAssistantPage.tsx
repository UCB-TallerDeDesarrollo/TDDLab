import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Button, CircularProgress, TextField, Paper, Box } from '@mui/material';
import AIResultSection from './components/AIResultSection';
import { EvaluateWithAI } from '../../modules/AIAssistant/application/EvaluateWithAI';
import axios from 'axios';

// Usa la variable de entorno
import { VITE_API } from '../../../config'; // Importar la configuración de la API
const API_URL = VITE_API + "/AIAssistant"

const evaluateWithAIUseCase = new EvaluateWithAI();

const AIAssistantPage = () => {
  const location = useLocation();
  const repositoryLink = location.state?.repositoryLink || "No hay enlace disponible";

  const [analysisResponse, setAnalysisResponse] = useState<string>("");
  const [refactorResponse, setRefactorResponse] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [loadingRefactor, setLoadingRefactor] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Chatbot state
  const [userMessage, setUserMessage] = useState<string>("");
  const [messages, setMessages] = useState<{ from: 'user' | 'bot', text: string }[]>([]);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);

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
  const handleChatSubmit = async () => {
    if (!userMessage.trim()) return;
    setLoadingChat(true);

    const newMessages = [...messages, { from: 'user', text: userMessage }];
    setMessages(newMessages);

    try {
      const response = await axios.post(`${API_URL}/chatbot`, {
        input: userMessage
      });

      const botReply = response.data.response?.result || "No hubo respuesta del asistente.";
      setMessages([...newMessages, { from: 'bot', text: botReply }]);
    } catch (error) {
      console.error("Error en el chatbot:", error);
      setMessages([...newMessages, { from: 'bot', text: "Error de conexión con el servidor." }]);
    } finally {
      setUserMessage("");
      setLoadingChat(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" align="center" gutterBottom>Asistente IA</Typography>

      <Typography variant="body1" align="center" gutterBottom>
        <strong>Repositorio:</strong>{" "}
        <a href={repositoryLink} target="_blank" rel="noopener noreferrer">
          {repositoryLink}
        </a>
      </Typography>

      {errorMessage && (
        <Typography variant="body2" color="error" align="center" gutterBottom>
          {errorMessage}
        </Typography>
      )}

      {/* Secciones de análisis */}
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={4} mb={4}>
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
      </Box>

      {/* Chatbot */}
      <Paper elevation={3} style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
        <Typography variant="h6" gutterBottom>Chatbot Asistente</Typography>

        <Box
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 10,
            height: 300,
            overflowY: "auto",
            marginBottom: 16,
            backgroundColor: "#fafafa",
          }}
        >
          {messages.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              Inicia una conversación con el asistente...
            </Typography>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 10 }}>
              <strong>{msg.from === 'user' ? 'Tú' : 'Asistente'}:</strong> {msg.text}
            </div>
          ))}
        </Box>

        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            label="Escribe tu mensaje..."
            variant="outlined"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleChatSubmit();
              }
            }}
          />
          <Button variant="contained" onClick={handleChatSubmit} disabled={loadingChat}>
            {loadingChat ? <CircularProgress size={24} /> : "Enviar"}
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default AIAssistantPage;
