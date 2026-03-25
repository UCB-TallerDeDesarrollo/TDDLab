import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import EditAssignmentForm from "./EditAssignmentForm";
import { getStatusIcon, getStatusTooltip } from "../../Shared/statusHelpers";

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

const AssignmentRow = styled(Box)(({ theme }) => ({
  width: "100%",
  minHeight: 69,
  border: "0.5px solid #898989",
  borderRadius: 5,
  backgroundColor: "#FFFFFF",
  padding: theme.spacing(1.5, 2.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
}));

const AssignmentTitle = styled(Typography)({
  color: "#000000",
  fontSize: 20,
  fontWeight: 400,
  lineHeight: "24px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const AssignmentActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  flexWrap: "wrap",
}));

const AssignmentActionIcon = styled(IconButton)({
  width: 40,
  height: 40,
  borderRadius: "50%",
  color: "#002346",
  backgroundColor: "rgba(71, 133, 196, 0.08)",
});

const Assignment: React.FC<AssignmentProps> = ({
  assignment,
  index,
  handleClickDetail,
  handleClickDelete,
  handleRowHover,
  role,
}) => {
  const [groupName, setGroupName] = useState("");
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  useEffect(() => {
    const fetchGroupName = async () => {
      if (!assignment.groupid) {
        return;
      }

      try {
        const groupsRepository = new GroupsRepository();
        const group = await groupsRepository.getGroupById(assignment.groupid);
        if (group) {
          setGroupName(group.groupName);
        }
      } catch (error) {
        console.error("Error fetching group name:", error);
      }
    };

    fetchGroupName();
  }, [assignment.groupid]);

  const statusIcon = getStatusIcon(assignment.state);

  return (
    <AssignmentRow key={assignment.id}>
      <AssignmentTitle>{assignment.title}</AssignmentTitle>
      <AssignmentActions>
        <Tooltip title="Ver tarea" arrow>
          <AssignmentActionIcon
            aria-label="see"
            onClick={() => handleClickDetail(index)}
            onMouseEnter={() => handleRowHover(index)}
            onMouseLeave={() => handleRowHover(null)}
          >
            <VisibilityIcon />
          </AssignmentActionIcon>
        </Tooltip>

        {isAdmin(role) && isEditFormOpen ? (
          <EditAssignmentForm
            assignmentId={assignment.id}
            currentGroupName={groupName}
            currentTitle={assignment.title}
            currentDescription={assignment.description}
            onClose={() => setIsEditFormOpen(false)}
          />
        ) : null}

        {isAdmin(role) && !isEditFormOpen ? (
          <Tooltip title="Editar tarea" arrow>
            <AssignmentActionIcon
              aria-label="edit"
              onClick={() => setIsEditFormOpen(true)}
            >
              <EditIcon />
            </AssignmentActionIcon>
          </Tooltip>
        ) : null}

        {isAdmin(role) ? (
          <Tooltip title="Eliminar tarea" arrow>
            <AssignmentActionIcon
              aria-label="delete"
              onClick={() => handleClickDelete(index)}
              onMouseEnter={() => handleRowHover(index)}
              onMouseLeave={() => handleRowHover(null)}
            >
              <DeleteIcon />
            </AssignmentActionIcon>
          </Tooltip>
        ) : null}

        <Tooltip title={getStatusTooltip(assignment.state)} arrow>
          <AssignmentActionIcon
            aria-label="status"
            onMouseEnter={() => handleRowHover(index)}
            onMouseLeave={() => handleRowHover(null)}
          >
            {statusIcon}
          </AssignmentActionIcon>
        </Tooltip>
      </AssignmentActions>
    </AssignmentRow>
  );
};

export default Assignment;
