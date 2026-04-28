import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import NavButtons from "../../../src/sections/MainMenu/components/NavButtons";
import { NavLink } from "../../../src/types/navigation.types";

const mockLinks: NavLink[] = [
  { title: "Tareas", path: "/", icon: null as any, access: ["student"] },
  { title: "Grupos", path: "/groups", icon: null as any, access: ["teacher"] },
];

const renderNavButtons = (activeButton?: string) =>
  render(
    <BrowserRouter>
      <NavButtons links={mockLinks} activeButton={activeButton} />
    </BrowserRouter>
  );

describe("NavButtons", () => {
  it("debería renderizar todos los links", () => {
    renderNavButtons();
    expect(screen.getByText("Tareas")).toBeInTheDocument();
    expect(screen.getByText("Grupos")).toBeInTheDocument();
  });

  it("debería aplicar borde inferior al botón activo", () => {
    renderNavButtons("Tareas");
    const button = screen.getByText("Tareas").closest("a");
    expect(button).toHaveStyle("border-bottom: 2px solid #fff");
  });

  it("no debería aplicar borde inferior a botones inactivos", () => {
    renderNavButtons("Tareas");
    const button = screen.getByText("Grupos").closest("a");
    expect(button).toHaveStyle("border-bottom: none");
  });

  it("debería renderizar sin botón activo", () => {
    renderNavButtons(undefined);
    expect(screen.getByText("Tareas")).toBeInTheDocument();
    expect(screen.getByText("Grupos")).toBeInTheDocument();
  });

  it("debería renderizar lista vacía sin errores", () => {
    render(
      <BrowserRouter>
        <NavButtons links={[]} activeButton={undefined} />
      </BrowserRouter>
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});