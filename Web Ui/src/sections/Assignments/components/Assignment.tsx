import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";

import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditAssignmentForm from "./EditAssignmentForm"; // Import the new form
import Tooltip from "@mui/material/Tooltip";

function isAdmin(role: string): boolean {
  return role === "admin";
}

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "in progress":
      return "En progreso";
    case "delivered":
      return "Enviado";
    default:
      return status;
  }
};

interface AssignmentProps {
  assignment: AssignmentDataObject;
  index: number;
  handleClickDetail: (index: number) => void;
  handleClickDelete: (index: number) => void;
  handleRowHover: (index: number | null) => void;
  role: string;
}

const Assignment: React.FC<AssignmentProps> = ({
  assignment,
  index,
  handleClickDetail,
  handleClickDelete,
  handleRowHover,
  role,
}) => {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const statusText = getStatusText(assignment.state);

  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
  };

  return (
    <TableRow key={assignment.id}>
      <TableCell>{assignment.title}</TableCell>
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
          {/* Replace the EditIconButton with the EditAssignmentForm */}
          {isEditFormOpen ? (
            <EditAssignmentForm
              assignmentId={assignment.id}
              onClose={handleCloseEditForm}
            />
          ) : (
            <Tooltip title="Editar tarea" arrow>
              <IconButton aria-label="edit" onClick={handleEditClick}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}

          {isAdmin(role) && (
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
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
            <span>{statusText}</span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Assignment;
