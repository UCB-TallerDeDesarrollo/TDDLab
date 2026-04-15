import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import React, { useState, useEffect } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditAssignmentForm from "./EditAssignmentForm";
import Tooltip from "@mui/material/Tooltip";
import { getStatusIcon, getStatusTooltip } from "../../Shared/statusHelpers";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository"

// Estilos 
const styles = {
  tableRow: {
    borderBottom: "2px solid #E7E7E7",
  },
  titleCell: {
    width: "20%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  actionsCell: {
    width: "30%",
    maxWidth: "300px",
  },
  actionsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "nowrap",
  },
} as const;

function isAdmin(role: string): boolean {
  return role === "admin" || role === "teacher";
}

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
  const [groupName, setGroupName] = useState<string>("");
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  useEffect(() => {
    if (assignment.groupid) {
      fetchGroupName(assignment.groupid);
    }
  }, [assignment.groupid]);

  const fetchGroupName = async (groupId: number) => {
    try {
      const groupsRepository = new GroupsRepository();
      const group = await groupsRepository.getGroupById(groupId);
      if (group) setGroupName(group.groupName);
    } catch (error) {
      console.error("Error fetching group name:", error);
    }
  };

  const handleEditClick = () => setIsEditFormOpen(true);
  const handleCloseEditForm = () => setIsEditFormOpen(false);
  
  const statusIcon = getStatusIcon(assignment.state);
  const userIsAdmin = isAdmin(role); // Refactor simple para legibilidad

  return (
    <TableRow key={assignment.id} sx={styles.tableRow}>
      {/* Celda de Título */}
      <TableCell sx={styles.titleCell}>
        {assignment.title}
      </TableCell>

      {/* Celda de Acciones */}
      <TableCell sx={styles.actionsCell}>
        <div style={styles.actionsContainer}>
          
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

          {userIsAdmin && (
            isEditFormOpen ? (
              <EditAssignmentForm
                assignmentId={assignment.id}
                currentGroupName={groupName}
                currentTitle={assignment.title}
                currentDescription={assignment.description}
                onClose={handleCloseEditForm}
              />
            ) : (
              <Tooltip title="Editar tarea" arrow>
                <IconButton aria-label="edit" onClick={handleEditClick}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )
          )}

          {userIsAdmin && (
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

          <Tooltip title={getStatusTooltip(assignment.state)} arrow>
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

export default Assignment;