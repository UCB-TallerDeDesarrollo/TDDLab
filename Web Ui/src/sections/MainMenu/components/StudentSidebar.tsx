import SidebarNav, { SidebarLink } from "./SidebarNav";

const iconMap: Record<string, string> = {
  "Tareas": "mdi:clipboard-check-outline",
  "Mis Practicas": "mdi:code-tags",
};

const labelMap: Record<string, string> = {
  "Mis Practicas": "Mis Prácticas",
};

interface StudentSidebarProps {
  navArrayLinks: SidebarLink[];
  mobileOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function StudentSidebar({
  navArrayLinks,
  mobileOpen = false,
  onClose,
  isMobile = false
}: Readonly<StudentSidebarProps>) {
  return (
    <SidebarNav
      links={navArrayLinks}
      iconMap={iconMap}
      labelMap={labelMap}
      isMobile={isMobile}
      mobileOpen={mobileOpen}
      onClose={onClose}
      filterLinks={(links) =>
        links.filter(
          (item) => item.title === "Tareas" || item.title === "Mis Practicas"
        )
      }
    />
  );
}