import SidebarNav, { SidebarLink } from "./SidebarNav";

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
  navArrayLinks: SidebarLink[];
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
  return (
    <SidebarNav
      links={navArrayLinks}
      iconMap={iconMap}
      labelMap={labelMap}
      isMobile={isMobile}
      mobileOpen={mobileOpen}
      onClose={onClose}
      filterLinks={(links) => links.filter((item) => item.access.includes("teacher"))}
    />
  );
}
