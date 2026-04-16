import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import EditAssignmentForm from "./EditAssignmentForm";
import Tooltip from "@mui/material/Tooltip";
import { getStatusIcon, getStatusTooltip } from "../../Shared/statusHelpers";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { styled } from "@mui/system";

export const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
});

function isAdmin(role: string): boolean {
  return role === "admin" || role === "teacher";
}

export interface AssignmentActionsProps {
  assignment: AssignmentDataObject;
  index: number;
  handleClickDetail: (index: number) => void;
  handleClickDelete: (index: number) => void;
  handleRowHover: (index: number | null) => void;
  role: string;
  groupName: string;
  isEditFormOpen: boolean;
  onEditClick: () => void;
  onCloseEditForm: () => void;
}

export const AssignmentActions: React.FC<AssignmentActionsProps> = ({
  assignment,
  index,
  handleClickDetail,
  handleClickDelete,
  handleRowHover,
  role,
  groupName,
  isEditFormOpen,
  onEditClick,
  onCloseEditForm,
}) => {
  const statusIcon = getStatusIcon(assignment.state);
  const userIsAdmin = isAdmin(role);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <ButtonContainer>
      <Tooltip title="Ver tarea" arrow>
        <IconButton
          aria-label="see"
          onClick={(e) => { stop(e); handleClickDetail(index); }}
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
            onClose={onCloseEditForm}
          />
        ) : (
          <Tooltip title="Editar tarea" arrow>
            <IconButton
              aria-label="edit"
              onClick={(e) => { stop(e); onEditClick(); }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )
      )}

      {userIsAdmin && (
        <Tooltip title="Eliminar tarea" arrow>
          <IconButton
            aria-label="delete"
            onClick={(e) => { stop(e); handleClickDelete(index); }}
            onMouseEnter={() => handleRowHover(index)}
            onMouseLeave={() => handleRowHover(null)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title={getStatusTooltip(assignment.state)} arrow>
        <IconButton aria-label="status" onClick={stop}>
          {statusIcon}
        </IconButton>
      </Tooltip>
    </ButtonContainer>
  );
};

interface AssignmentProps {
  assignment: AssignmentDataObject;
  index: number;
  handleClickDetail: (index: number) => void;
  handleClickDelete: (index: number) => void;
  handleRowHover: (index: number | null) => void;
  role: string;
}

const Assignment: React.FC<AssignmentProps> = (props) => {
  const [groupName, setGroupName] = useState<string>("");
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  useEffect(() => {
    if (props.assignment.groupid) {
      fetchGroupName(props.assignment.groupid);
    }
  }, [props.assignment.groupid]);

  const fetchGroupName = async (groupId: number) => {
    try {
      const groupsRepository = new GroupsRepository();
      const group = await groupsRepository.getGroupById(groupId);
      if (group) setGroupName(group.groupName);
    } catch (error) {
      console.error("Error fetching group name:", error);
    }
  };

  return (
    <AssignmentActions
      {...props}
      groupName={groupName}
      isEditFormOpen={isEditFormOpen}
      onEditClick={() => setIsEditFormOpen(true)}
      onCloseEditForm={() => setIsEditFormOpen(false)}
    />
  );
};

export default Assignment;