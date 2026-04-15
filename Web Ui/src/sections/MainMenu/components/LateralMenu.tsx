import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { IconifyIcon } from "../../../sections/Shared/Components";

interface NavItem {
  title: string;
  path: string;
  icon: string;
}
interface NavLateralMenuProps {
  navArrayLinks: NavItem[];
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
          <Box sx={{ display: 'flex', alignItems: 'center', ml: '14px', mt: 2, mb: 1 }}>
            <img src="/logo.svg" alt="TDDLab Logo" style={{ height: "32px", width: "auto" }} />
          </Box>

          {navArrayLinks.map((item) => (
            <ListItem disablePadding key={item.title}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <ListItemIcon>
                  <IconifyIcon icon={item.icon} color="primary" hoverColor="#1565c0" />
                </ListItemIcon>
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
                <IconifyIcon icon="mdi:login" color="primary" hoverColor="#1565c0" />
              </ListItemIcon>
              <ListItemText>Iniciar sesión</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
    </Box>
  );
}
