import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
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
  "Mis Practicas": "Mis Prácticas",
};

interface TeacherSidebarProps {
  navArrayLinks: { title: string; path: string; icon: string; access: string[] }[];
  mobileOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function TeacherSidebar({ 
  navArrayLinks, 
  mobileOpen = false, 
  onClose,
  isMobile = false 
}: Readonly<TeacherSidebarProps>) {
  const location = useLocation();

  const drawerContent = (
    <Box>
      {/* Menu items */}
      <Box sx={{ px: 2, pt: 3 }}>
        <List sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
          {navArrayLinks
            .filter((item) => item.access.includes("teacher"))
            .map((item) => {
              const displayLabel = labelMap[item.title] || item.title;
              const displayIcon = iconMap[item.title] || item.icon;

              const isSelected =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <ListItem key={item.title} disablePadding>
                  <ListItemButton
                    component={NavLink}
                    to={item.path}
                    onClick={onClose}
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
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 280,
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          borderRight: "none",
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
          top: isMobile ? 0 : 90, // Position below the top bar on desktop
          height: isMobile ? "100%" : "calc(100% - 90px)",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
