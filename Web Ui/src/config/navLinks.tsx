import { NavLink } from "../types/navigation.types";
import GroupsIcon from "@mui/icons-material/Groups";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import CodeIcon from "@mui/icons-material/Code";   
import PersonIcon from "@mui/icons-material/Person";
import ReorderIcon from "@mui/icons-material/Reorder";

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
        icon: <FactCheckIcon />,
        access: ["admin", "student", "teacher"],
    },
    {
        title: "Mis Practicas",
        path: "/mis-practicas",
        icon: <CodeIcon />,
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
        icon: <ReorderIcon />,
        access: ["admin", "teacher"],
    },
];