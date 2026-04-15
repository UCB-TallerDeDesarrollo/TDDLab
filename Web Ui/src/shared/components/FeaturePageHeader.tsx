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
  boxSizing: "border-box",
  height: 69,
  border: "1.5px solid #898989",
  borderRadius: 5,
  boxSizing: "border-box",
  paddingInline: theme.spacing(12.75, 2.25),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    height: "auto",
    minHeight: 69,
    padding: theme.spacing(2),
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

const HeaderTitle = styled(Typography)({
  color: "#002346",
  fontSize: 24,
  fontWeight: 700,
  lineHeight: "29px",
  fontFamily: '"Inter", sans-serif',
});

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: theme.spacing(1.25),
  flexWrap: "nowrap",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
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
