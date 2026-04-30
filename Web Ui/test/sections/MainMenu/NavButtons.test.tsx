import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import NavButtons from "../../../src/sections/MainMenu/components/NavButtons";
import React from "react";

const mockLinks = [
  { title: "Tareas", path: "/", icon: React.createElement("span"), access: ["student"] },
  { title: "Grupos", path: "/groups", icon: React.createElement("span"), access: ["teacher"] },
];

const renderNavButtons = (activeButton: string | undefined) =>
  render(
    <BrowserRouter>
      <NavButtons links={mockLinks} activeButton={activeButton} />
    </BrowserRouter>
  );

describe("NavButtons", () => {
  it("debería renderizar todos los links", () => {
    renderNavButtons(undefined);
    expect(screen.getByText("Tareas")).toBeInTheDocument();
    expect(screen.getByText("Grupos")).toBeInTheDocument();
  });

  it("debería renderizar sin botón activo", () => {
    renderNavButtons(undefined);
    expect(screen.getByText("Tareas")).toBeInTheDocument();
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