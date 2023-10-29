import { Box, Divider,List, ListItem, ListItemIcon,ListItemButton,ListItemText } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import { ReactElement } from "react";

interface NavItem {
    title: string;
    path: string;
    icon: ReactElement;
}
export default function NavLateralMenu({ navLinks }: { navLinks: NavItem[] }) {
    return(
        <Box sx={{width:250}}>
            
            <nav>
                <List>
                    {
                        navLinks.map(item=>(
                            <ListItem 
                                disablePadding
                                key={item.title}>
                                
                                <ListItemButton
                                component="a"
                                href={item.path}
                                
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText>{item.title}</ListItemText>
                                </ListItemButton>
                            </ListItem>

                        ))
                    }
                    
                </List>
            </nav>
        </Box>
    )
}