import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import HomePage from "../../../src/presentation/home/pages/HomePage";
import { useAuthStore } from "../../../src/modules/User-Authentication/domain/authStore";
import { UserRole } from "../../../src/modules/User-Authentication/domain/session.types";

describe("HomePage", () => {
  function setAuthData(
    userid: number,
    userEmail: string,
  ) {
    useAuthStore.setState({
      authData: {
        userid,
        userProfilePic: "",
        userEmail,
        usergroupid: 10,
        userRole: UserRole.Teacher,
      },
    });
  }

  beforeEach(() => {
    setAuthData(1, "israel.guzman@ucb.edu.bo");
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
    expect(
      screen.getByRole("img", { name: "Isotipo TDD Lab" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "TDD Lab" })).toBeInTheDocument();
  });

  it("renders the empty state when there is no active user data", () => {
    setAuthData(-1, "");

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("No hay datos de usuario")).toBeInTheDocument();
  });

  it("renders the error state when the authenticated session is invalid", () => {
    setAuthData(1, "");

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("No se pudo cargar la página de inicio"),
    ).toBeInTheDocument();
  });
});
