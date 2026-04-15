import { NavLink } from "../types/navigation.types";
import GroupsIcon from "@mui/icons-material/Groups";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import { NoteAdd } from "@mui/icons-material";

export const navArrayLinks: NavLink[] = [
    {
        title: "Grupos",
        path: "/groups",
        icon: <GroupsIcon />,
        access: ["admin", "teacher"],
    },
    {
        title: "Tareas",
        path: "/",
        icon: <DescriptionIcon />,
        access: ["admin", "student", "teacher"],
    },
    {
        title: "Mis Practicas",
        path: "/mis-practicas",
        icon: <NoteAdd />,
        access: ["admin", "teacher", "student"],
    },
    {
        title: "Usuarios",
        path: "/user",
        icon: <PersonIcon />,
        access: ["admin", "teacher"],
    },
    {
        title: "Configuraciones",
        path: "/configuraciones",
        icon: <SettingsIcon />,
        access: ["admin", "teacher"],
    },
];