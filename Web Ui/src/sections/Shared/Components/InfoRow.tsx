import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value?: ReactNode;
  containerSx?: SxProps<Theme>;
  textSx?: SxProps<Theme>;
}

export const InfoRow = ({
  icon,
  label,
  value,
  containerSx,
  textSx,
}: InfoRowProps) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 1.75, ...containerSx }}>
    <Box sx={{ mr: 1 }}>{icon}</Box>
    <Typography variant="body2" color="text.secondary" sx={textSx}>
      <strong>{label}:</strong> {value}
    </Typography>
  </Box>
);
