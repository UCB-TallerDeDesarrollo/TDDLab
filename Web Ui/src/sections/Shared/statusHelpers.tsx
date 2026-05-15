import { IconifyIcon } from "./Components";

export const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <IconifyIcon icon="mdi:alert" color="warning" hoverColor="#f57c00" />;
      case "in progress":
        return <IconifyIcon icon="mdi:progress-clock" color="info" hoverColor="#0288d1" />;
      case "delivered":
        return <IconifyIcon icon="mdi:check-circle" color="success" hoverColor="#2e7d32" />;
      default:
        return null;
    }
  };
  
export const getStatusTooltip = (status: string) => {
  switch (status) {
    case "pending":
      return "Tarea no iniciada";
    case "in progress":
      return "Tarea en progreso";
    case "delivered":
      return "Tarea enviada";
    default:
      return "";
  }
};


export const getStatusTooltipPractice = (status: string) => {
  switch (status) {
    case "pending":
      return "Practica no iniciada";
    case "in progress":
      return "Practica en progreso";
    case "delivered":
      return "Practica enviada";
    default:
      return "";
  }
};