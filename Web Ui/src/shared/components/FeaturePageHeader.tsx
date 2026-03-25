import { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

interface FeaturePageHeaderProps {
  title: string;
  actions?: ReactNode;
}

const HeaderContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  minHeight: 69,
  border: "1.5px solid #898989",
  borderRadius: 5,
  padding: theme.spacing(2, 2.25),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    alignItems: "stretch",
    flexDirection: "column",
  },
}));

const HeaderTitle = styled(Typography)({
  color: "#002346",
  fontSize: 24,
  fontWeight: 700,
  lineHeight: "29px",
});

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing(1.25),
  flexWrap: "wrap",
}));

function FeaturePageHeader({
  title,
  actions,
}: Readonly<FeaturePageHeaderProps>) {
  return (
    <HeaderContainer>
      <HeaderTitle>{title}</HeaderTitle>
      {actions ? <ActionsContainer>{actions}</ActionsContainer> : null}
    </HeaderContainer>
  );
}

export default FeaturePageHeader;
