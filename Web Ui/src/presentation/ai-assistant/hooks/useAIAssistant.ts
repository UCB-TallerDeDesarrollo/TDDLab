import { useState } from "react";
import { v4 as generateUniqueId } from "uuid";
import { evaluateRepository, sendChatMessage } from "../services/aiAssistant.service";
import {
  AssistantAction,
  AssistantMessage,
} from "../types/aiAssistant.types";

const EMPTY_REPOSITORY_MESSAGE = "No hay enlace disponible";

function createBotMessage(text: string): AssistantMessage {
  return { id: generateUniqueId(), from: "bot", text };
}

function createUserMessage(text: string): AssistantMessage {
  return { id: generateUniqueId(), from: "user", text };
}

function getLoadingText(action: AssistantAction) {
  switch (action) {
    case "analiza":
      return "Analizando TDD...";
    case "refactoriza":
      return "Analizando Refactoring...";
    case "califica":
      return "Calificando TDD...";
  }
}

export function useAIAssistant(repositoryLink: string) {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    createBotMessage("¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte hoy?"),
  ]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingAction, setLoadingAction] = useState<AssistantAction | null>(null);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [...prev, createBotMessage(text)]);
  };

  const submitChatMessage = async () => {
    if (!userMessage.trim()) {
      return;
    }

    const currentUserMessage = userMessage;
    const nextMessages = [...messages, createUserMessage(currentUserMessage)];
    setUserMessage("");
    setLoadingChat(true);
    setMessages(nextMessages);

    try {
      const botReply = await sendChatMessage(currentUserMessage);
      setMessages([...nextMessages, createBotMessage(botReply)]);
    } catch (error) {
      console.error("Error al enviar mensaje al chatbot:", error);
      setMessages([
        ...nextMessages,
        createBotMessage("Error de conexión con el servidor."),
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  const runAssistantAction = async (action: AssistantAction) => {
    if (!repositoryLink || repositoryLink === EMPTY_REPOSITORY_MESSAGE) {
      addBotMessage(`No hay un enlace de repositorio válido para ${action}`);
      return;
    }

    const loadingText = getLoadingText(action);
    setLoadingAction(action);
    addBotMessage(loadingText);

    try {
      const result = await evaluateRepository(repositoryLink, action);
      setMessages((prev) => [
        ...prev.filter((message) => message.text !== loadingText),
        createBotMessage(result),
      ]);
    } catch (error) {
      console.error("Error al ejecutar acción del asistente:", error);
      setMessages((prev) => [
        ...prev.filter((message) => message.text !== loadingText),
        createBotMessage("Error al comunicarse con el servidor."),
      ]);
    } finally {
      setLoadingAction(null);
    }
  };

  return {
    userMessage,
    messages,
    loadingChat,
    loadingAction,
    setUserMessage,
    submitChatMessage,
    runAssistantAction,
  };
}
