import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditAssignmentForm from "./EditAssignmentForm";
import Tooltip from "@mui/material/Tooltip";
import { getStatusIcon, getStatusTooltip } from "../../Shared/statusHelpers";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { GenericCard } from "../../Shared/Components/GenericList";
import './Assignment.css';
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
  //group,
}) => {

  const [groupName, setGroupName] = useState<string>("");

  useEffect(() => {
    if (assignment.groupid) {
      fetchGroupName(assignment.groupid);
    }
  }, [assignment.groupid]);

  const fetchGroupName = async (groupId: number) => {
    try {
      const groupsRepository = new GroupsRepository();
      const group = await groupsRepository.getGroupById(groupId);
      if (group) {
        setGroupName(group.groupName);
      }
    } catch (error) {
      console.error("Error fetching group name:", error);
    }
  };

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
  };
  const statusIcon = getStatusIcon(assignment.state);

  return (
    <GenericCard
      title={assignment.title}
      onHover={(hovered) => handleRowHover(hovered ? index : null)}
      onClick={() => handleClickDetail(index)}
      actions={
        <>
          {isAdmin(role) && isEditFormOpen ? (
            <EditAssignmentForm
              assignmentId={assignment.id}
              currentGroupName={groupName}
              currentTitle={assignment.title}
              currentDescription={assignment.description}
              onClose={handleCloseEditForm}
            />
          ) : (
            isAdmin(role) && (
              <Tooltip title="Editar tarea" arrow>
                <IconButton aria-label="edit" onClick={(e) => { e.stopPropagation(); handleEditClick(); }} size="small" className="action-icon-btn">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          )}

          {isAdmin(role) && (
            <Tooltip title="Eliminar tarea" arrow>
              <IconButton
                aria-label="delete"
                onClick={(e) => { e.stopPropagation(); handleClickDelete(index); }}
                size="small"
                className="action-icon-btn"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={getStatusTooltip(assignment.state)} arrow>
            <IconButton
              aria-label="status"
              size="small"
              className="action-icon-btn"
            >
              {statusIcon}
            </IconButton>
          </Tooltip>
        </>
      }
    />
  );
};

export default Assignment;
