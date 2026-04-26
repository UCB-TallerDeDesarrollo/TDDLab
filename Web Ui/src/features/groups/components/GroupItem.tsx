import { Box, Typography, IconButton, Stack } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import GroupsIcon from "@mui/icons-material/Groups";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Group } from "../types";

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
      
      {/* NOMBRE */}
      <Typography className="group-name">
        {group.name}
      </Typography>

      {/* ACCIONES */}
      <Stack direction="row" className="group-actions">



        <IconButton size="small" onClick={onCopy}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" onClick={onLink}>
          <LinkIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" onClick={onParticipants}>
          <GroupsIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" onClick={onTasks}>
        <AssignmentIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" onClick={onDelete}>
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      </Stack>

      <IconButton size="small" onClick={onEdit}>
      <EditIcon fontSize="small" />
      </IconButton>

    </Box>
  );
}