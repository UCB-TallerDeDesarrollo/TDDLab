import { Box, Typography, Stack } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import GroupsIcon from "@mui/icons-material/Groups";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Group } from "../types";
import AnimatedIcon from "../../../shared/components/AnimatedIcon";

interface Props {

  group: Group;
  onCopy: () => void;
  onLink: () => void;
  onParticipants: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onTasks: () => void;
}

export function GroupItem({
  group,
  onCopy,
  onLink,
  onParticipants,
  onDelete,
  onEdit, 
  onTasks,
}: Props) {
  return (
    <Box className="group-item-card">
      <Typography className="group-name">
        {group.name}
      </Typography>

      <Stack direction="row" className="group-actions">
        <AnimatedIcon
          title="Copiar enlace docente"
          actionType="duplicate"
          aria-label="copy-teacher-link"
          size="small"
          onClick={onCopy}
          icon={<ContentCopyIcon fontSize="small" />}
        />

        <AnimatedIcon
          title="Copiar enlace estudiante"
          actionType="link"
          aria-label="copy-student-link"
          size="small"
          onClick={onLink}
          icon={<LinkIcon fontSize="small" />}
        />

        <AnimatedIcon
          title="Ver participantes"
          actionType="groups"
          aria-label="view-participants"
          size="small"
          onClick={onParticipants}
          icon={<GroupsIcon fontSize="small" />}
        />

        <AnimatedIcon
          title="Ver tareas"
          actionType="view"
          aria-label="view-tasks"
          size="small"
          onClick={onTasks}
          icon={<AssignmentIcon fontSize="small" />}
        />

        <AnimatedIcon
          title="Eliminar grupo"
          actionType="delete"
          aria-label="delete-group"
          size="small"
          onClick={onDelete}
          icon={<DeleteIcon fontSize="small" />}
        />

        <AnimatedIcon
          title="Editar grupo"
          actionType="edit"
          aria-label="edit-group"
          size="small"
          onClick={onEdit}
          icon={<EditIcon fontSize="small" />}
        />
      </Stack>
    </Box>
  );
}
