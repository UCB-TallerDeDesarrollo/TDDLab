import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import HomePage from "../../../src/presentation/home/pages/HomePage";
import { useAuthStore } from "../../../src/presentation/auth/store/useAuthStore";

jest.mock("../../../src/presentation/auth/store/useAuthStore");

const mockedUseAuthStore = useAuthStore as unknown as jest.Mock;

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the approved welcome and TDD Lab identity", () => {
    mockedUseAuthStore.mockImplementation((selector: any) =>
      selector({
        user: { id: "1", email: "israel.guzman@ucb.edu.bo" },
        loading: false,
      })
    );

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", {
        name: "Hola Israel, bienvenido al TDD Lab!!!",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Isotipo TDD Lab" })
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "TDD Lab" })).toBeInTheDocument();
  });

  it("renders the loading state while session data is not ready", () => {
    mockedUseAuthStore.mockImplementation((selector: any) =>
      selector({
        user: null,
        loading: true,
      })
    );

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Cargando inicio")).toBeInTheDocument();
  });

  it("renders the empty state when there is no active user data", () => {
    mockedUseAuthStore.mockImplementation((selector: any) =>
      selector({
        user: { id: "-1", email: "" },
        loading: false,
      })
    );

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText("No hay datos de usuario")).toBeInTheDocument();
  });

  it("renders the error state when the authenticated session is invalid", () => {
    mockedUseAuthStore.mockImplementation((selector: any) =>
      selector({
        user: { id: "1", email: undefined },
        loading: false,
      })
    );

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(
      screen.getByText("No hay datos de usuario")
    ).toBeInTheDocument();
  });
});
