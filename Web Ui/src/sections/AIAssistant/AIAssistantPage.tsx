import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Typography, Box, Button, CircularProgress, TextField, Paper, IconButton, Tooltip, Avatar
} from '@mui/material';
import { EvaluateWithAI } from '../../modules/AIAssistant/application/EvaluateWithAI';
import { ChatbotUseCase } from '../../modules/AIAssistant/application/ChatbotUseCase';
import { v4 as generateUniqueId } from 'uuid';
import { IconifyIcon } from '../../sections/Shared/Components';

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
    <Box sx={{ padding: 4, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconifyIcon icon="mdi:chat-outline" color="#1976D2" hoverColor="#1565c0" />
          <Typography variant="h5" fontWeight="bold">Asistente IA</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <IconifyIcon icon="mdi:github" color="gray" hoverColor="#333" />
          <a
            href={repositoryLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none',
              color: 'gray',
              fontSize: 14
            }}
          >
            {repositoryLink}
          </a>
        </Box>
      </Box>

      {/* Contenedor Chat + Botones */}
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 3 }}>
        {/* Chat Section */}
        <Paper
          elevation={3}
          sx={{maxWidth: '1100px',flexGrow: 1,display: 'flex',flexDirection: 'column',padding: 2,borderRadius: 2,height: '100%',maxHeight: '80vh', overflow: 'hidden'}}>
                  {/* Mensajes */}
        <Box
          sx={{flexGrow: 1, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column', gap: 2, height: '100%'}}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {msg.from === 'bot' ? (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, maxWidth: '75%' }}>
                    <Avatar sx={{ color:'#1976D2' ,bgcolor: '#F1F5F9', width: 32, height: 32 }}>
                      <IconifyIcon icon="mdi:robot" width={20} height={20} color="#1976D2" hoverColor="#1565c0" />
                    </Avatar>
                    <Box
                      sx={{
                        backgroundColor: '#F1F5F9',
                        color: '#000',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        whiteSpace: 'pre-line',
                        maxWidth: '100%',
                      }}
                    >
                      <Typography variant="body2">{msg.text}</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      backgroundColor: '#e3f2fd',
                      color: '#000',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: '75%',
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word',
                    }}
                  >
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
                <IconButton 
                  onClick={handleChatSubmit} 
                  disabled={loadingChat || !userMessage.trim()} 
                  color="primary"
                  sx={{
                    transition: "all 0.175s ease-out",
                    "&:hover:not(:disabled)": {
                      filter: "brightness(0.9)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    },
                    "&:active:not(:disabled)": {
                      transform: "scale(0.97)",
                    },
                  }}
                >
                  {loadingChat ? <CircularProgress size={24} /> : <IconifyIcon icon="mdi:send" color="#1976D2" hoverColor="#1565c0" />}
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
            startIcon={<IconifyIcon icon="mdi:code-braces" width={20} height={20} color="white" hoverColor="#e0e0e0" />}
            sx={{
              transition: "all 0.175s ease-out",
              "&:hover:not(:disabled)": {
                filter: "brightness(0.9)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
              "&:active:not(:disabled)": {
                transform: "scale(0.97)",
              },
            }}
          >
            {loadingAction === "analiza" ? <CircularProgress size={20} /> : " Analizar TDD"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApiCall("refactoriza")}
            disabled={loadingAction !== null}
            fullWidth
            startIcon={<IconifyIcon icon="mdi:refresh" width={20} height={20} color="white" hoverColor="#e0e0e0" />}
            sx={{
              transition: "all 0.175s ease-out",
              "&:hover:not(:disabled)": {
                filter: "brightness(0.9)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
              "&:active:not(:disabled)": {
                transform: "scale(0.97)",
              },
            }}
          >
            {loadingAction === "refactoriza" ? <CircularProgress size={20} /> : " Analizar Refactoring"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleApiCall("califica")}
            disabled={loadingAction !== null}
            fullWidth
            startIcon={<IconifyIcon icon="mdi:star" width={20} height={20} color="white" hoverColor="#e0e0e0" />}
            sx={{
              transition: "all 0.175s ease-out",
              "&:hover:not(:disabled)": {
                filter: "brightness(0.9)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
              "&:active:not(:disabled)": {
                transform: "scale(0.97)",
              },
            }}
          >
            {loadingAction === "califica" ? <CircularProgress size={20} /> : "Evaluar TDD"}
            </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AIAssistantPage;
