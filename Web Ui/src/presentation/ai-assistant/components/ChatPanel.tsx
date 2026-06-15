import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { AssistantMessage } from "../types/aiAssistant.types";

interface ChatPanelProps {
  loadingChat: boolean;
  messages: AssistantMessage[];
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
  userMessage: string;
}

export default function ChatPanel({
  loadingChat,
  messages,
  onMessageChange,
  onSubmit,
  userMessage,
}: Readonly<ChatPanelProps>) {
  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: "1100px",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        padding: 2,
        borderRadius: 2,
        height: "100%",
        maxHeight: "80vh",
        overflow: "hidden",
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2, display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: "flex",
              justifyContent: message.from === "user" ? "flex-end" : "flex-start",
            }}
          >
            {message.from === "bot" ? (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, maxWidth: "75%" }}>
                <Avatar sx={{ color: "#1976D2", bgcolor: "#F1F5F9", width: 32, height: 32 }}>
                  <SmartToyIcon fontSize="small" />
                </Avatar>
                <Box
                  sx={{
                    backgroundColor: "#F1F5F9",
                    color: "#000",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    whiteSpace: "pre-line",
                    maxWidth: "100%",
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#000",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "75%",
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                }}
              >
                <Typography variant="body2">{message.text}</Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Escribe tu mensaje aquí..."
          value={userMessage}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            }
          }}
        />
        <Tooltip title="Enviar">
          <span>
            <IconButton onClick={onSubmit} disabled={loadingChat || !userMessage.trim()} color="primary">
              {loadingChat ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}
