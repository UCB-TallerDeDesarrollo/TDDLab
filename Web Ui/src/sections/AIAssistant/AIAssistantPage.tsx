import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Box, Button, CircularProgress, TextField, Paper } from '@mui/material';
import { EvaluateWithAI } from '../../modules/AIAssistant/application/EvaluateWithAI';
import { ChatbotUseCase } from '../../modules/AIAssistant/application/ChatbotUseCase';
import AIResultSection from './components/AIResultSection';
import { v4 as generateUniqueId } from 'uuid';

const evaluateWithAIUseCase = new EvaluateWithAI();
const chatbotUseCase = new ChatbotUseCase();

const AIAssistantPage = () => {
  const location = useLocation();
  const repositoryLink = location.state?.repositoryLink || "No hay enlace disponible";

  const [analysisResponse, setAnalysisResponse] = useState<string>("");
  const [refactorResponse, setRefactorResponse] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [loadingRefactor, setLoadingRefactor] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [userMessage, setUserMessage] = useState<string>("");
  const [messages, setMessages] = useState<{ from: 'user' | 'bot', text: string }[]>([]);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);

  const handleApiCall = async (
    action: "analiza" | "refactoriza",
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

    const newMessages = [...messages, { id: generateUniqueId(), from: 'user', text: userMessage }];
    setMessages(newMessages);

    try {
      const botReply = await chatbotUseCase.sendMessage(userMessage);
      setMessages([...newMessages, { from: 'bot', text: botReply }]);
    } catch (error) {
      console.error("Error al enviar mensaje al chatbot:", error);
      setMessages([...newMessages, { from: 'bot', text: "Error de conexión con el servidor." }]);
    } finally {
      setUserMessage("");
      setLoadingChat(false);
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
          onAction={() => handleApiCall("analiza", setLoadingAnalysis, setAnalysisResponse)}
          buttonText="Evaluar la aplicación de TDD"
        />
        <AIResultSection
          title="Procesando..."
          response={refactorResponse}
          loading={loadingRefactor}
          onAction={() => handleApiCall("refactoriza", setLoadingRefactor, setRefactorResponse)}
          buttonText="Evaluar la aplicación de Refactoring"
        />
      </div>
      <div style={{ margin: '20px 0' }}></div>
      {/* Sección del Chatbot */}
      <Paper elevation={3} style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
        <Typography variant="h6" gutterBottom>TDD Buddy</Typography>

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
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 10 }}>
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
