import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import React from "react";

jest.mock("../../../src/modules/User-Authentication/application/checkIfUserHasAccount");
jest.mock("../../../src/modules/User-Authentication/application/deleteSessionCookie");
jest.mock("../../../src/modules/User-Authentication/application/signInWithGithub");
jest.mock("../../../src/modules/User-Authentication/application/signOutWithGithub");
jest.mock("../../../src/modules/User-Authentication/application/setCookieAndGlobalStateForValidUser");
jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: jest.fn(() => [{ userEmail: "test@test.com", userProfilePic: "" }]),
  setGlobalState: jest.fn(),
}));

import MainMenu from "../../../src/sections/MainMenu/MainMenu";

const mockLinks = [
  { title: "Tareas", path: "/", icon: React.createElement("span"), access: ["admin", "student", "teacher"] },
  { title: "Grupos", path: "/groups", icon: React.createElement("span"), access: ["admin", "teacher"] },
];

const renderMainMenu = (userRole: string) =>
  render(
    <BrowserRouter>
      <MainMenu navArrayLinks={mockLinks} userRole={userRole} />
    </BrowserRouter>
  );

describe("MainMenu", () => {
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