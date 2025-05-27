import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { FaCheck } from "react-icons/fa6";
import { TbRotateClockwise2 } from "react-icons/tb";

export const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <PriorityHighIcon style={{ fontSize: 26 }} />;
      case "in progress":
        return (
          <TbRotateClockwise2 size={27.4} style={{ strokeWidth: "2.7px" }} />
        );
      case "delivered":
        return <FaCheck size={24.4} style={{ strokeWidth: "9.5px" }} />;
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