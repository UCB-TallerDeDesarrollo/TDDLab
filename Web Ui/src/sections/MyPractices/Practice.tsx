import React, { useState } from "react";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditPracticeForm from "./EditPracticeForm";
import Tooltip from "@mui/material/Tooltip";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { FaCheck } from "react-icons/fa6";
import { TbRotateClockwise2 } from "react-icons/tb";

const getStatusIcon = (status: string) => {
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
const getStatusTooltip = (status: string) => {
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

interface PracticeProps {
  practice: PracticeDataObject;
  index: number;
  handleClickDetail: (index: number) => void;
  handleClickDelete: (index: number) => void;
  handleRowHover: (index: number | null) => void;
  role: string;
}

const Practice: React.FC<PracticeProps> = ({
  practice,
  index,
  handleClickDetail,
  handleClickDelete,
  handleRowHover,
}) => {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
  };
  const statusIcon = getStatusIcon(practice.state);

  return (
    <TableRow
      key={practice.id}
      sx={{
        borderBottom: "2px solid #E7E7E7",
      }}
    >
      <TableCell>{practice.title}</TableCell>
      <TableCell>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Tooltip title="Ver tarea" arrow>
            <IconButton
              aria-label="see"
              onClick={() => handleClickDetail(index)}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {isEditFormOpen ? (
            <EditPracticeForm
              practiceId={practice.id}
              currentTitle={practice.title}
              currentDescription={practice.description}
              onClose={handleCloseEditForm}
            />
          ) : (
            <Tooltip title="Editar tarea" arrow>
              <IconButton aria-label="edit" onClick={handleEditClick}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Eliminar tarea" arrow>
            <IconButton
              aria-label="delete"
              onClick={() => handleClickDelete(index)}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={getStatusTooltip(practice.state)} arrow>
            <IconButton
              aria-label="status"
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              {statusIcon}
            </IconButton>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Practice;
