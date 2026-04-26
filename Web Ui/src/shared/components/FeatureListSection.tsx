import { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

interface FeatureListSectionProps {
  title?: string;
  children: ReactNode;
}

const SectionContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(1.75),
}));

const SectionTitle = styled(Typography)({
  color: "#002346",
  fontSize: 24,
  fontWeight: 700,
  lineHeight: "29px",
});

function FeatureListSection({
  title,
  children,
}: Readonly<FeatureListSectionProps>) {
  return (
    <SectionContainer>
      {title ? <SectionTitle>{title}</SectionTitle> : null}
      {children}
    </SectionContainer>
  );
}

export default FeatureListSection;
