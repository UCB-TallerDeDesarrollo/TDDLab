import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";

import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditAssignmentForm from "./EditAssignmentForm"; // Import the new form

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
}

const Assignment: React.FC<AssignmentProps> = ({
  assignment,
  index,
  handleClickDetail,
  handleClickDelete,
  handleRowHover,
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
          <IconButton
            aria-label="see"
            onClick={() => handleClickDetail(index)}
            onMouseEnter={() => handleRowHover(index)}
            onMouseLeave={() => handleRowHover(null)}
          >
            <VisibilityIcon />
          </IconButton>

          {/* Replace the EditIconButton with the EditAssignmentForm */}
          {isEditFormOpen ? (
            <EditAssignmentForm
              assignmentId={assignment.id}
              onClose={handleCloseEditForm}
            />
          ) : (
            <IconButton aria-label="edit" onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          )}

          <IconButton
            aria-label="delete"
            onClick={() => handleClickDelete(index)}
            onMouseEnter={() => handleRowHover(index)}
            onMouseLeave={() => handleRowHover(null)}
          >
            <DeleteIcon />
          </IconButton>
          <span>{statusText}</span>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default Assignment;
