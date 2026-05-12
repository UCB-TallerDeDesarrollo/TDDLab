import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { FaCheck } from "react-icons/fa6";
import { TbRotateClockwise2 } from "react-icons/tb";
import "./Styles/sharedStyles.css";

export const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <PriorityHighIcon className="status-icon-pending" />;
      case "in progress":
        return <TbRotateClockwise2 className="status-icon-progress" />;
      case "delivered":
        return <FaCheck className="status-icon-delivered" />;
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