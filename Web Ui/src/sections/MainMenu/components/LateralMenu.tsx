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
  return (
    <Box sx={{ width: 250 }}>
      <nav>
        <List>
          <Typography sx={{ marginLeft: "14px" }}>TDDLab</Typography>

          {navArrayLinks.map((item) => (
            <ListItem disablePadding key={item.title}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.title}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
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
