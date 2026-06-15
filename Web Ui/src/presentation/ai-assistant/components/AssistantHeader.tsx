import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Box, Typography } from "@mui/material";

interface AssistantHeaderProps {
  repositoryLink: string;
}

export default function AssistantHeader({
  repositoryLink,
}: Readonly<AssistantHeaderProps>) {
  return (
    <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box display="flex" alignItems="center" gap={1}>
        <ChatBubbleOutlineIcon fontSize="small" sx={{ color: "#1976D2" }} />
        <Typography variant="h5" fontWeight="bold">
          Asistente IA
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <GitHubIcon fontSize="small" sx={{ color: "gray" }} />
        <a
          href={repositoryLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            color: "gray",
            fontSize: 14,
          }}
        >
          {repositoryLink}
        </a>
      </Box>
    </Box>
  );
}
