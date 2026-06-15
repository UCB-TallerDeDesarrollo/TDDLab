import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import AssistantActions from "../components/AssistantActions";
import AssistantHeader from "../components/AssistantHeader";
import ChatPanel from "../components/ChatPanel";
import { useAIAssistant } from "../hooks/useAIAssistant";

const DEFAULT_REPOSITORY_LINK = "No hay enlace disponible";

export default function AIAssistantPage() {
  const location = useLocation();
  const repositoryLink = location.state?.repositoryLink || DEFAULT_REPOSITORY_LINK;
  const assistant = useAIAssistant(repositoryLink);

  return (
    <Box sx={{ padding: 4, display: "flex", flexDirection: "column", height: "100vh" }}>
      <AssistantHeader repositoryLink={repositoryLink} />
      <Box sx={{ display: "flex", flexGrow: 1, gap: 3 }}>
        <ChatPanel
          loadingChat={assistant.loadingChat}
          messages={assistant.messages}
          onMessageChange={assistant.setUserMessage}
          onSubmit={assistant.submitChatMessage}
          userMessage={assistant.userMessage}
        />
        <AssistantActions
          loadingAction={assistant.loadingAction}
          onAction={assistant.runAssistantAction}
        />
      </Box>
    </Box>
  );
}
