import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useLocation, NavLink } from "react-router-dom";
import { IconifyIcon } from "../../../sections/Shared/Components";

// Icon mapping based on the user's mockup
const iconMap: Record<string, string> = {
  "Grupos": "mdi:account-group",
  "Tareas": "mdi:clipboard-check-outline",
  "Mis Practicas": "mdi:code-tags",
  "Usuarios": "mdi:account",
  "Configuraciones": "mdi:menu", // In mockup it looks like a hamburger menu for "Ajustes"
};

const labelMap: Record<string, string> = {
  "Configuraciones": "Ajustes",
  "Mis Practicas": "Mi prácticas",
};

interface TeacherSidebarProps {
  navArrayLinks: { title: string; path: string; icon: string; access: string[] }[];
}

export default function TeacherSidebar({ navArrayLinks }: Readonly<TeacherSidebarProps>) {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: 260, 
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          borderRight: "none",
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)"
        },
      }}
    >
      {/* Header / Logo section */}
      <Box
        sx={{
          height: 90,
          backgroundColor: "#0d1b2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconifyIcon icon="mdi:view-grid" color="#4a8bff" width={32} height={32} />
            <Box sx={{ display: 'flex', flexDirection: 'column', color: 'white', lineHeight: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '1px', m: 0 }}>
                  TDD
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 400, letterSpacing: '4px', m: 0, ml: '2px' }}>
                  LAB
                </Typography>
            </Box>
         </Box>
      </Box>

      {/* Menu items */}
      <Box sx={{ px: 2, pt: 8 }}>
        <List sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
          {navArrayLinks
            .filter((item) => item.access.includes("teacher"))
            .map((item) => {
              const displayLabel = labelMap[item.title] || item.title;
              const displayIcon = iconMap[item.title] || item.icon;

              // Check if selected. Special logic for root "/" path vs "/groups"
              const isSelected =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <ListItem key={item.title} disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    sx={{
                      borderRadius: "12px",
                      mb: 1.5,
                      py: 1.5,
                      px: 3,
                      backgroundColor: isSelected ? "#e9ecef" : "transparent",
                      color: isSelected ? "#2B59C3" : "#0d1b2a",
                      "&:hover": {
                        backgroundColor: isSelected ? "#e9ecef" : "#f8f9fa",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isSelected ? "#2B59C3" : "#0d1b2a",
                      }}
                    >
                      <IconifyIcon 
                        icon={displayIcon} 
                        width={26} 
                        height={26} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={displayLabel}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: "1.05rem",
                          letterSpacing: "0.2px"
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>
      </Box>
    </Drawer>
  );
}
