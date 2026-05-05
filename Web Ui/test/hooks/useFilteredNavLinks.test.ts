import { useFilteredNavLinks } from "../../src/hooks/useFilteredNavLinks";
import { NavLink } from "../../src/types/navigation.types";

const mockLinks: NavLink[] = [
  {
    title: "Grupos",
    path: "/groups",
    icon: null as any,
    access: ["admin", "teacher"],
  },
  {
    title: "Tareas",
    path: "/",
    icon: null as any,
    access: ["admin", "student", "teacher"],
  },
  {
    title: "Usuarios",
    path: "/user",
    icon: null as any,
    access: ["admin"],
  },
];

describe("useFilteredNavLinks", () => {
  it("debería retornar solo los links accesibles para el rol student", () => {
    const result = useFilteredNavLinks(mockLinks, "student");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Tareas");
  });

  it("debería retornar solo los links accesibles para el rol teacher", () => {
    const result = useFilteredNavLinks(mockLinks, "teacher");
    expect(result).toHaveLength(2);
    expect(result.map((l) => l.title)).toEqual(["Grupos", "Tareas"]);
  });

  it("debería retornar todos los links para el rol admin", () => {
    const result = useFilteredNavLinks(mockLinks, "admin");
    expect(result).toHaveLength(3);
  });

  it("debería retornar array vacío para un rol desconocido", () => {
    const result = useFilteredNavLinks(mockLinks, "desconocido");
    expect(result).toHaveLength(0);
  });

  it("debería retornar array vacío si no hay links", () => {
    const result = useFilteredNavLinks([], "admin");
    expect(result).toHaveLength(0);
  });
});