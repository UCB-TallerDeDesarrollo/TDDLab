import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import LoginIcon from "@mui/icons-material/Login";
import { NavLink as NavLinkType } from "../../../types/navigation.types";
import { useLocation } from "react-router-dom";

interface NavLateralMenuProps {
  navArrayLinks: NavLinkType[];
  NavLink: React.ComponentType<any>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NavLateralMenu({
  navArrayLinks,
  NavLink,
  setOpen,
}: Readonly<NavLateralMenuProps>) {
  const location = useLocation();

  return (
    <Box sx={{ width: 250 }}>
      <nav>
        <List>
          <Typography sx={{ marginLeft: "14px" }}>TDDLab</Typography>

          {navArrayLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem disablePadding key={item.title}>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  sx={{
                    borderLeft: isActive ? "4px solid #002345" : "4px solid transparent",
                    backgroundColor: isActive ? "rgba(0, 35, 69, 0.08)" : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(0, 35, 69, 0.05)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? "#002345" : "inherit" }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.title}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? "#002345" : "inherit",
                    }}></ListItemText>
                </ListItemButton>
              </ListItem>
            );
          })}

          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/login"
              onClick={() => setOpen(false)}
            >
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText>Iniciar sesión</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
    </Box>
  );
}
