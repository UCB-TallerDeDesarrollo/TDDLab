import { Box } from "@mui/material";

interface TDDLabLogoProps {
  compact?: boolean;
}

export default function TDDLabLogo({ compact = false }: Readonly<TDDLabLogoProps>) {
  const logoWidth = compact ? 104 : 120;

  return (
    <Box
      component="img"
      src="/landing/logo.svg"
      alt="TDD Lab"
      sx={{
        width: `${logoWidth}px`,
        height: "auto",
        display: "block",
      }}
    />
  );
}
