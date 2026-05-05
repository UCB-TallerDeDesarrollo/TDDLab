import { navArrayLinks } from "../../src/config/navLinks";

describe("navArrayLinks", () => {
  it("debería contener 5 links de navegación", () => {
    expect(navArrayLinks).toHaveLength(5);
  });

  it("cada link debería tener title, path, icon y access definidos", () => {
    navArrayLinks.forEach((link) => {
      expect(link.title).toBeDefined();
      expect(link.path).toBeDefined();
      expect(link.icon).toBeDefined();
      expect(link.access).toBeDefined();
      expect(Array.isArray(link.access)).toBe(true);
    });
  });

  it("debería contener el link de Tareas accesible para todos los roles", () => {
    const tareas = navArrayLinks.find((l) => l.title === "Tareas");
    expect(tareas).toBeDefined();
    expect(tareas?.access).toContain("admin");
    expect(tareas?.access).toContain("teacher");
    expect(tareas?.access).toContain("student");
  });

  it("Grupos solo debería ser accesible para admin y teacher", () => {
    const grupos = navArrayLinks.find((l) => l.title === "Grupos");
    expect(grupos?.access).toContain("admin");
    expect(grupos?.access).toContain("teacher");
    expect(grupos?.access).not.toContain("student");
  });

  it("Configuraciones solo debería ser accesible para admin y teacher", () => {
    const config = navArrayLinks.find((l) => l.title === "Configuraciones");
    expect(config?.access).toContain("admin");
    expect(config?.access).toContain("teacher");
    expect(config?.access).not.toContain("student");
  });

  it("los paths deberían ser únicos", () => {
    const paths = navArrayLinks.map((l) => l.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });
});