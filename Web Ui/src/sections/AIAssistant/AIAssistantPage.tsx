import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Typography, Box, Button, CircularProgress, TextField, Paper, IconButton, Tooltip, Avatar
} from '@mui/material';
import { EvaluateWithAI } from '../../modules/AIAssistant/application/EvaluateWithAI';
import { ChatbotUseCase } from '../../modules/AIAssistant/application/ChatbotUseCase';
import { v4 as generateUniqueId } from 'uuid';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import GitHubIcon from '@mui/icons-material/GitHub';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CodeIcon from '@mui/icons-material/Code';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import GradeIcon from '@mui/icons-material/Grade';
import './AIAssistantPage.css';

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
  const [loadingAction, setLoadingAction] = useState<null | "analiza" | "refactoriza"| "califica">(null);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: generateUniqueId(), from: "bot", text }]);
  };

 const handleChatSubmit = async () => {
  if (!userMessage.trim()) return;

  const currentUserMessage = userMessage;
  setUserMessage(""); // Borrar el mensaje inmediatamente
  setLoadingChat(true);

  const newMessages = [...messages, { id: generateUniqueId(), from: "user" as "user", text: currentUserMessage }];
  setMessages(newMessages);

  try {
    const botReply = await chatbotUseCase.sendMessage(currentUserMessage);
    setMessages([...newMessages, { id: generateUniqueId(), from: "bot" as "bot", text: botReply }]);
  } catch (error) {
    console.error("Error al enviar mensaje al chatbot:", error);
    setMessages([
      ...newMessages,
      { id: generateUniqueId(), from: "bot" as "bot", text: "Error de conexión con el servidor." }
    ]);
  } finally {
    setLoadingChat(false);
  }
};

  const handleApiCall = async (action: "analiza" | "refactoriza" | "califica") => {
  if (!repositoryLink || repositoryLink === "No hay enlace disponible") {
    alert(`No hay un enlace de repositorio válido para ${action}`);
    return;
  }

  setLoadingAction(action);

  let loadingText = "";
  switch (action) {
    case "analiza":
      loadingText = "Analizando TDD...";
      break;
    case "refactoriza":
      loadingText = "Analizando Refactoring...";
      break;
    case "califica":
      loadingText = "Calificando TDD...";
      break;
  }

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
    <Box className="ai-assistant-page">
      {/* Header */}
      <Box className="ai-assistant-header">
        <Box display="flex" alignItems="center" gap={1}>
          <ChatBubbleOutlineIcon fontSize="small" className="ai-assistant-header-icon" />
          <Typography variant="h5" fontWeight="bold">Asistente IA</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <GitHubIcon fontSize="small" className="ai-assistant-github-icon" />
          <a
            href={repositoryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ai-assistant-repo-link"
          >
            {repositoryLink}
          </a>
        </Box>
      </Box>

      {/* Contenedor Chat + Botones */}
      <Box className="ai-assistant-chat-container">
        {/* Chat Section */}
        <Paper
          elevation={3}
          className="ai-assistant-chat-paper">
                  {/* Mensajes */}
        <Box
          className="ai-assistant-messages">
            {messages.map((msg) => (
              <Box
                key={msg.id}
                className={msg.from === 'user' ? 'ai-assistant-msg-user' : 'ai-assistant-msg-bot'}
              >
                {msg.from === 'bot' ? (
                  <Box className="ai-assistant-bot-row">
                    <Avatar className="ai-assistant-bot-avatar">
                      <SmartToyIcon fontSize="small" />
                    </Avatar>
                    <Box className="ai-assistant-bot-bubble">
                      <Typography variant="body2">{msg.text}</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box className="ai-assistant-user-bubble">
                    <Typography variant="body2">{msg.text}</Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Input */}
          <Box display="flex" gap={1}>
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

        {/* Botones al costado */}
        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApiCall("analiza")}
            disabled={loadingAction !== null}
            fullWidth
            startIcon={<CodeIcon />}
          >
            {loadingAction === "analiza" ? <CircularProgress size={20} /> : " Analizar TDD"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApiCall("refactoriza")}
            disabled={loadingAction !== null}
            fullWidth
            startIcon={<AutorenewIcon />}
          >
            {loadingAction === "refactoriza" ? <CircularProgress size={20} /> : " Analizar Refactoring"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApiCall("califica")}
            disabled={loadingAction !== null}
            fullWidth
            startIcon={<GradeIcon />}
          >
            {loadingAction === "califica" ? <CircularProgress size={20} /> : "Evaluar TDD"}
            </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AIAssistantPage;
