import { Box } from "@mui/material";

interface TDDLabLogoProps {
  compact?: boolean;
}

export default function TDDLabLogo({ compact = false }: Readonly<TDDLabLogoProps>) {
  const logoWidth = compact ? 104 : 120;

  return (
    <Box
      component="img"
      src="/Logo.png"
      alt="TDD Lab"
      sx={{
        width: `${logoWidth}px`,
        height: "auto",
        display: "block",
      }}
    />
  );
}
