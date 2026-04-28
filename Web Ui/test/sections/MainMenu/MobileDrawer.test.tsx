import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import MobileDrawer from "../../../src/sections/MainMenu/components/MobileDrawer";
import { NavLink } from "../../../src/types/navigation.types";

const mockLinks: NavLink[] = [
  { title: "Tareas", path: "/", icon: null as any, access: ["student"] },
  { title: "Grupos", path: "/groups", icon: null as any, access: ["teacher"] },
];

const renderMobileDrawer = () =>
  render(
    <BrowserRouter>
      <MobileDrawer navArrayLinks={mockLinks} />
    </BrowserRouter>
  );

describe("MobileDrawer", () => {
  it("debería renderizar el botón hamburguesa", () => {
    renderMobileDrawer();
    expect(screen.getByTestId("MenuIcon")).toBeInTheDocument();
  });

  it("el drawer debería estar cerrado inicialmente", () => {
    renderMobileDrawer();
    expect(screen.queryByText("Tareas")).not.toBeInTheDocument();
  });

  it("debería abrir el drawer al hacer clic en el botón hamburguesa", () => {
    renderMobileDrawer();
    const menuButton = screen.getByTestId("MenuIcon").closest("button")!;
    fireEvent.click(menuButton);
    expect(screen.getByText("Tareas")).toBeInTheDocument();
    expect(screen.getByText("Grupos")).toBeInTheDocument();
  });

  it("debería cerrar el drawer al hacer clic fuera", () => {
    renderMobileDrawer();
    const menuButton = screen.getByTestId("MenuIcon").closest("button")!;
    fireEvent.click(menuButton);
    expect(screen.getByText("Tareas")).toBeInTheDocument();

    const backdrop = document.querySelector(".MuiBackdrop-root") as HTMLElement;
    if (backdrop) fireEvent.click(backdrop);

    expect(screen.queryByText("Tareas")).not.toBeInTheDocument();
  });
});