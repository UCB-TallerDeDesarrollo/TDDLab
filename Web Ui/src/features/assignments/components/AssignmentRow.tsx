import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import EditAssignmentForm from "../../../sections/Assignments/components/EditAssignmentForm";
import { getStatusIcon, getStatusTooltip } from "../../../sections/Shared/statusHelpers";
import { AssignmentListItemViewModel } from "../types/assignmentScreen";

interface AssignmentRowProps {
  item: AssignmentListItemViewModel;
  canManage: boolean;
  onDelete: (assignmentId: number) => void;
  onView: (assignmentId: number) => void;
}

const RowContainer = styled(Box)(({ theme }) => ({
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

const RowTitle = styled(Typography)({
  color: "#000000",
  fontSize: 20,
  fontWeight: 400,
  lineHeight: "24px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  flexWrap: "wrap",
}));

const ActionIcon = styled(IconButton)({
  width: 40,
  height: 40,
  borderRadius: "50%",
  color: "#002346",
  backgroundColor: "rgba(71, 133, 196, 0.08)",
});

function AssignmentRow({
  item,
  canManage,
  onDelete,
  onView,
}: Readonly<AssignmentRowProps>) {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const statusIcon = getStatusIcon(item.state);

  return (
    <RowContainer>
      <RowTitle>{item.title}</RowTitle>
      <ActionsContainer>
        <Tooltip title="Ver tarea" arrow>
          <ActionIcon aria-label="see" onClick={() => onView(item.id)}>
            <VisibilityIcon />
          </ActionIcon>
        </Tooltip>

        {canManage && isEditFormOpen ? (
          <EditAssignmentForm
            assignmentId={item.id}
            currentGroupName={item.groupName}
            currentTitle={item.title}
            currentDescription={item.description}
            onClose={() => setIsEditFormOpen(false)}
          />
        ) : null}

        {canManage && !isEditFormOpen ? (
          <Tooltip title="Editar tarea" arrow>
            <ActionIcon aria-label="edit" onClick={() => setIsEditFormOpen(true)}>
              <EditIcon />
            </ActionIcon>
          </Tooltip>
        ) : null}

        {canManage ? (
          <Tooltip title="Eliminar tarea" arrow>
            <ActionIcon aria-label="delete" onClick={() => onDelete(item.id)}>
              <DeleteIcon />
            </ActionIcon>
          </Tooltip>
        ) : null}

        <Tooltip title={getStatusTooltip(item.state)} arrow>
          <ActionIcon aria-label="status">
            {statusIcon}
          </ActionIcon>
        </Tooltip>
      </ActionsContainer>
    </RowContainer>
  );
}

export default AssignmentRow;
