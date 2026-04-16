import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import EditAssignmentForm from "./EditAssignmentForm";
import { getStatusIcon, getStatusTooltip } from "../../../shared/helpers/statusHelpers";
import { AssignmentListItemViewModel } from "../types/assignmentScreen";
import AnimatedIcon from "../../../shared/components/AnimatedIcon";

interface AssignmentRowProps {
  item: AssignmentListItemViewModel;
  canManage: boolean;
  onDelete: (assignmentId: number) => void;
  onView: (assignmentId: number) => void;
}

const RowContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 69,
  border: "0.5px solid #898989",
  borderRadius: 5,
  backgroundColor: "#FFFFFF",
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: "#F0F4F8",
  },
  padding: theme.spacing(1.625, 2.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  boxSizing: "border-box",
  [theme.breakpoints.down("md")]: {
    height: "auto",
    minHeight: 69,
    alignItems: "flex-start",
    flexDirection: "column",
  },
}));

const RowTitle = styled(Typography)({
  color: "#000000",
  fontSize: 20,
  fontWeight: 400,
  lineHeight: "24px",
  fontFamily: '"Inter", sans-serif',
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
        <AnimatedIcon
          title="Ver tarea"
          actionType="view"
          aria-label="see"
          onClick={() => onView(item.id)}
          icon={<VisibilityIcon />}
        />

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
          <AnimatedIcon
            title="Editar tarea"
            actionType="edit"
            aria-label="edit"
            onClick={() => setIsEditFormOpen(true)}
            icon={<EditIcon />}
          />
        ) : null}

        {canManage ? (
          <AnimatedIcon
            title="Eliminar tarea"
            actionType="delete"
            aria-label="delete"
            onClick={() => onDelete(item.id)}
            icon={<DeleteIcon />}
          />
        ) : null}

        <AnimatedIcon
          title={getStatusTooltip(item.state)}
          actionType="default"
          aria-label="status"
          icon={statusIcon}
        />
      </ActionsContainer>
    </RowContainer>
  );
}

export default AssignmentRow;
