import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { styled } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

import { HomeFeatureLink } from "../types/home.types";

const AccessSection = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: theme.spacing(2),
  marginTop: theme.spacing(7),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}));

const AccessCard = styled(RouterLink)(({ theme }) => ({
  minHeight: 72,
  borderRadius: 8,
  border: "1px solid rgba(0, 35, 70, 0.18)",
  padding: theme.spacing(1.5, 2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "#002346",
  textDecoration: "none",
  backgroundColor: "#FFFFFF",
  boxShadow: "0 8px 24px rgba(0, 35, 70, 0.06)",
  transition: "transform 180ms ease, box-shadow 180ms ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 30px rgba(0, 35, 70, 0.12)",
  },
  "&:focus-visible": {
    outline: "3px solid rgba(19, 112, 210, 0.35)",
    outlineOffset: 2,
  },
}));

interface HomeFeatureAccessProps {
  links: HomeFeatureLink[];
}

function HomeFeatureAccess({ links }: Readonly<HomeFeatureAccessProps>) {
  if (links.length === 0) {
    return null;
  }

  return (
    <AccessSection aria-label="Accesos principales">
      {links.map((link) => (
        <AccessCard key={link.path} to={link.path}>
          <Typography sx={{ fontWeight: 700 }}>{link.title}</Typography>
          <ArrowForwardRoundedIcon fontSize="small" />
        </AccessCard>
      ))}
    </AccessSection>
  );
}

export default HomeFeatureAccess;
