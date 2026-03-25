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
import LoginComponent from "./components/loginComponent";
import { mainMenuStyles } from "./styles/mainMenuStyles";

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
    <Box sx={mainMenuStyles.root}>
      <Box
        component={NavLink}
        to="/"
        sx={mainMenuStyles.logoLink}
      >
        <Box component="img" src={logo} alt="TDDLab Logo" sx={mainMenuStyles.logoImage} />
        <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {Array.from("TDD").map((char, idx) => (
                <Typography key={char+"tdd"+idx} variant="h5" fontWeight={100} sx={{ color: "#000000" }}>
                {char}
                </Typography>
            ))}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {["L", "A", "B"].map((char, idx) => (
                <Typography key={char+"lab"+idx} variant="caption" fontWeight={500} sx={{ color: "#1565c0" }}>
                {char}
                </Typography>
            ))}
            </Box>
        </Box>
      </Box>

      <List sx={mainMenuStyles.list}>
        {navArrayLinks.map(
          (item) =>
            item.access.includes(userRole) && (
              <ListItem disablePadding key={item.title} sx={mainMenuStyles.listItem}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  sx={{
                    ...mainMenuStyles.listItemButton,
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
                      minWidth: { xs: 32, md: 40 },
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

      <Box sx={mainMenuStyles.loginWrapper}>
        <LoginComponent />
      </Box>
    </Box>
  );
}
