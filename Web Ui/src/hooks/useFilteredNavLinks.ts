import { NavLink } from "../types/navigation.types";

export function useFilteredNavLinks(
    navLinks: NavLink[],
    userRole: string
): NavLink[] {
    return navLinks.filter((link) => link.access.includes(userRole));
}