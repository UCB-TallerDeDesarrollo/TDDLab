import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthPage from "../../../src/presentation/auth/pages/AuthPage";
import { useAuth } from "../../../src/presentation/auth/hooks/useAuth";

jest.mock("../../../src/presentation/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("AuthPage", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      loginWithGoogle: jest.fn(),
      loading: false,
      error: null,
      setError: jest.fn(),
    });
  });

  it("renders the TDD Lab logo", () => {
    render(<AuthPage />);

    expect(screen.getByRole("img", { name: /tdd lab logo/i })).toBeInTheDocument();
  });

  it("does not render the GitHub login button", () => {
    render(<AuthPage />);

    expect(
      screen.queryByRole("button", { name: /accedé con github/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the Google login button", () => {
    render(<AuthPage />);

    expect(
      screen.getByRole("button", { name: /accedé con google/i }),
    ).toBeInTheDocument();
  });

  it("renders welcome message", () => {
    render(<AuthPage />);

    expect(screen.getByText(/bienvenido al tdd lab/i)).toBeInTheDocument();
  });
});
