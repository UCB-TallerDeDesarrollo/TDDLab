import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import HomePage from "../../../src/features/home/pages/HomePage";
import { setGlobalState } from "../../../src/modules/User-Authentication/domain/authStates";

describe("HomePage", () => {
  beforeEach(() => {
    setGlobalState("authData", {
      userid: 1,
      userProfilePic: "",
      userEmail: "israel.guzman@ucb.edu.bo",
      usergroupid: 10,
      userRole: "teacher",
    });
  });

  it("renders the approved welcome and TDD Lab identity", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Hola Israel, bienvenido al TDD Lab!!!",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Isotipo TDD Lab" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "TDD Lab" })).toBeInTheDocument();
  });

  it("shows the main feature accesses available for teachers", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /grupos/i })).toHaveAttribute(
      "href",
      "/groups",
    );
    expect(screen.getByRole("link", { name: /tareas/i })).toHaveAttribute(
      "href",
      "/tareas",
    );
    expect(screen.getByRole("link", { name: /mis prácticas/i })).toHaveAttribute(
      "href",
      "/mis-practicas",
    );
  });
});
