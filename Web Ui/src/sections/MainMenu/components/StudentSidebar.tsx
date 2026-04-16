import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useLocation, NavLink } from "react-router-dom";
import { IconifyIcon } from "../../../sections/Shared/Components";

const iconMap: Record<string, string> = {
  "Tareas": "mdi:clipboard-check-outline",
  "Mis Practicas": "mdi:code-tags",
};

const labelMap: Record<string, string> = {
  "Mis Practicas": "Mis Prácticas",
};

interface StudentSidebarProps {
  navArrayLinks: { title: string; path: string; icon: string; access: string[] }[];
}

export default function StudentSidebar({ navArrayLinks }: Readonly<StudentSidebarProps>) {
  const location = useLocation();

  const studentLinks = navArrayLinks.filter(
    (item) => item.title === "Tareas" || item.title === "Mis Practicas"
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 280,
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          borderRight: "none",
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        },
      }}
    >
      <Box
        sx={{
          height: 90,
          backgroundColor: "#0d1b2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: "30px",
        }}
      >
        <img src="/logo.svg" alt="TDDLab Logo" style={{ height: "52px", width: "auto" }} />
      </Box>

      <Box sx={{ px: 2, pt: 3 }}>
        <List sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
          {studentLinks.map((item) => {
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
                    <IconifyIcon icon={displayIcon} width={26} height={26} />
                  </ListItemIcon>
                  <ListItemText
                    primary={displayLabel}
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: "1.05rem",
                        letterSpacing: "0.2px",
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