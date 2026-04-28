import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import MainMenu from "../../../src/sections/MainMenu/MainMenu";
import { NavLink } from "../../../src/types/navigation.types";

const mockLinks: NavLink[] = [
  {
    title: "Tareas",
    path: "/",
    icon: null as any,
    access: ["admin", "student", "teacher"],
  },
  {
    title: "Grupos",
    path: "/groups",
    icon: null as any,
    access: ["admin", "teacher"],
  },
];

const renderMainMenu = (userRole: string) =>
  render(
    <BrowserRouter>
      <MainMenu navArrayLinks={mockLinks} userRole={userRole} />
    </BrowserRouter>
  );

describe("MainMenu", () => {
  it("debería renderizar el logo de TDDLab", () => {
    renderMainMenu("admin");
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });

  it("debería mostrar solo los links permitidos para student", () => {
    renderMainMenu("student");
    expect(screen.getByText("Tareas")).toBeInTheDocument();
    expect(screen.queryByText("Grupos")).not.toBeInTheDocument();
  });

  it("debería mostrar todos los links para admin", () => {
    renderMainMenu("admin");
    expect(screen.getByText("Tareas")).toBeInTheDocument();
    expect(screen.getByText("Grupos")).toBeInTheDocument();
  });

  it("debería renderizar el AppBar", () => {
    renderMainMenu("admin");
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});