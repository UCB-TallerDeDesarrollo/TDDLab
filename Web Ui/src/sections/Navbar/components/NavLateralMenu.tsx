import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { ReactElement,Dispatch,SetStateAction } from "react";
//import { NavLink } from "react-router-dom";

interface NavItem {
  title: string;
  path: string;
  icon: ReactElement;
}
interface NavLateralMenuProps {
  navArrayLinks: NavItem[];
  NavLink: React.ComponentType<any>; 
  setOpen: Dispatch<SetStateAction<boolean>>;

}

export default function NavLateralMenu({ navArrayLinks, NavLink, setOpen }: NavLateralMenuProps) {
  return (
    <Box sx={{ width: 250 }}>
      <nav>
        <List>
          <Typography 
          sx={{ marginLeft: "14px" }}>
            TDDLab
          </Typography>
          
          {navArrayLinks.map((item) => (
            <ListItem
              disablePadding
              key={item.title}
            >
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
        </List>
      </nav>
    </Box>
  );
}
