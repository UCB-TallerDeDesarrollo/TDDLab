import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Typography, Box, Button, CircularProgress, TextField, Paper, IconButton, Tooltip
} from '@mui/material';
import { EvaluateWithAI } from '../../modules/AIAssistant/application/EvaluateWithAI';
import { ChatbotUseCase } from '../../modules/AIAssistant/application/ChatbotUseCase';
import { v4 as generateUniqueId } from 'uuid';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const evaluateWithAIUseCase = new EvaluateWithAI();
const chatbotUseCase = new ChatbotUseCase();

const AIAssistantPage = () => {
  const location = useLocation();
  const repositoryLink = location.state?.repositoryLink || "No hay enlace disponible";

  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState<{ id: string, from: "user" | "bot", text: string }[]>([
    { id: generateUniqueId(), from: "bot", text: "¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingAction, setLoadingAction] = useState<null | "analiza" | "refactoriza">(null);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: generateUniqueId(), from: "bot", text }]);
  };

  const handleChatSubmit = async () => {
    if (!userMessage.trim()) return;
    setLoadingChat(true);

    const newMessages = [...messages, { id: generateUniqueId(), from: "user", text: userMessage }];
    setMessages(newMessages);

    try {
      const botReply = await chatbotUseCase.sendMessage(userMessage);
      addBotMessage(botReply);
    } catch (error) {
      addBotMessage("Error de conexión con el servidor.");
    } finally {
      setUserMessage("");
      setLoadingChat(false);
    }
  };

  const handleApiCall = async (action: "analiza" | "refactoriza") => {
    if (!repositoryLink || repositoryLink === "No hay enlace disponible") {
      alert(`No hay un enlace de repositorio válido para ${action}`);
      return;
    }

    setLoadingAction(action);
    const loadingText = action === "analiza"
      ? "Analizando la aplicación de TDD..."
      : "Evaluando la aplicación de Refactoring...";
    addBotMessage(loadingText);

    try {
      const result = await evaluateWithAIUseCase.execute(repositoryLink, action);
      setMessages((prev) => [
        ...prev.filter(msg => msg.text !== loadingText),
        { id: generateUniqueId(), from: "bot", text: result }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter(msg => msg.text !== loadingText),
        { id: generateUniqueId(), from: "bot", text: "Error al comunicarse con el servidor." }
      ]);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Box sx={{ padding: 4, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Asistente IA</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <a href={repositoryLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#1976d2', fontSize: 14 }}>
            {repositoryLink}
          </a>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApiCall("analiza")}
            disabled={loadingAction !== null}
          >
            {loadingAction === "analiza" ? <CircularProgress size={20} /> : "TDD"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApiCall("refactoriza")}
            disabled={loadingAction !== null}
          >
            {loadingAction === "refactoriza" ? <CircularProgress size={20} /> : "Refactoring"}
          </Button>
        </Box>
      </Box>

      {/* Chat Section */}
      <Paper elevation={3} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 2, borderRadius: 2 }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <Box
                sx={{
                  backgroundColor: msg.from === 'user' ? '#e3f2fd' : '#f1f1f1',
                  color: '#000',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: '75%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.from === 'bot' && (
                  <SmartToyIcon fontSize="small" sx={{ color: '#1976d2' }} />
                )}
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Input */}
        <Box display="flex" gap={1} mt="auto">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Escribe tu mensaje aquí..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleChatSubmit();
              }
            }}
          />
          <Tooltip title="Enviar">
            <span>
              <IconButton onClick={handleChatSubmit} disabled={loadingChat || !userMessage.trim()} color="primary">
                {loadingChat ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  );
};

export default AIAssistantPage;
