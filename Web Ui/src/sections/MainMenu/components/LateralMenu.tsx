import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import LoginIcon from "@mui/icons-material/Login";
import { NavLink as NavLinkType } from "../../../types/navigation.types";
import { useLocation, Link } from "react-router-dom";
import TDDLabLogoDark from "../../../assets/TDDLabLogoDark";

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
          <Box sx={{ padding: "32px 14px 32px 2px", display: "flex", justifyContent: "center"  }}>
            <TDDLabLogoDark width={110} height={50} />
          </Box>

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
                    paddingY: "18px",
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
