import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import logo from '../../../public/tddlab.ico';
import { ReactElement } from "react";
import { useLocation, NavLink } from "react-router-dom";
import WindowIcon from "@mui/icons-material/Window";
import LoginComponent from "./components/loginComponent";

type NavLinkItem = {
  title: string;
  path: string;
  icon: ReactElement;
  access: string[];
};

interface NavbarProps {
  navArrayLinks: NavLinkItem[];
  userRole: string;
}

export default function MainMenu_v2({
  navArrayLinks,
  userRole,
}: Readonly<NavbarProps>) {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 220,
        height: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 8px rgba(0,0,0,0.10)",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      <Box
        component={NavLink}
        to="/"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 3,
          py: 3,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <img src={logo} alt="TDDLab Logo" style={{ width: 48, height: 48 }} />
        <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {Array.from("TDD").map((char) => (
                <Typography key={char} variant="h5" fontWeight={100} sx={{ color: "#000000" }}>
                {char}
                </Typography>
            ))}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {["L", "A", "B"].map((char) => (
                <Typography key={char} variant="caption" fontWeight={500} sx={{ color: "#1565c0" }}>
                {char}
                </Typography>
            ))}
            </Box>
        </Box>
      </Box>

      <List sx={{ flexGrow: 1, px: 1 }}>
        {navArrayLinks.map(
          (item) =>
            item.access.includes(userRole) && (
              <ListItem disablePadding key={item.title} sx={{ mb: 4 }}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{
                    borderRadius: 2,
                    color:
                      location.pathname === item.path ? "#1565c0" : "#1a1a2e",
                    backgroundColor:
                      location.pathname === item.path
                        ? "#e8f0fe"
                        : "transparent",
                    "&:hover": {
                      backgroundColor: "#f0f4ff",
                    },
                    "& .MuiListItemIcon-root": {
                      color:
                        location.pathname === item.path
                          ? "#1565c0"
                          : "#1a1a2e",
                      minWidth: 40,
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{ fontWeight: 500, fontSize: 15 }}
                  />
                </ListItemButton>
              </ListItem>
            )
        )}
      </List>

      <Box sx={{ px: 2, py: 2 }}>
        <LoginComponent />
      </Box>
    </Box>
  );
}
