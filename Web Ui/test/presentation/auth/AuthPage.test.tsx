import { StrictMode } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getAuth } from "firebase/auth";
import "@testing-library/jest-dom";
import AuthPage from "../../../src/presentation/auth/pages/AuthPage";
import { useAuth } from "../../../src/presentation/auth/hooks/useAuth";
import { mockAuth } from "../../modules/__mocks__/Auth/mockedAuthObject";

jest.mock("../../../src/presentation/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("firebase/auth", () => ({ getAuth: jest.fn() }));
jest.mock("../../../src/firebaseConfig", () => ({
  __esModule: true,
  default: {},
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedGetAuth = jest.mocked(getAuth);
const authStateReady = jest.fn<Promise<void>, []>();
const googleButton = () => screen.getByRole("button", { name: /accedé con google/i });

describe("AuthPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStateReady.mockImplementation(() => new Promise<void>(() => {}));
    mockedGetAuth.mockReturnValue({ ...mockAuth, authStateReady });
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
      screen.queryByRole("button", { name: /github/i }),
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

  it("waits for Firebase before allowing login and calls login directly on click", async () => {
    let ready!: () => void;
    authStateReady.mockReturnValue(new Promise<void>((resolve) => { ready = resolve; }));
    render(<AuthPage />);
    const { loginWithGoogle } = mockedUseAuth.mock.results[0].value;

    expect(googleButton()).toBeDisabled();
    fireEvent.click(googleButton());
    expect(loginWithGoogle).not.toHaveBeenCalled();

    await act(async () => { ready(); });

    expect(googleButton()).toBeEnabled();
    fireEvent.click(googleButton());
    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("keeps the button disabled while login is in progress", async () => {
    authStateReady.mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({
      loginWithGoogle: jest.fn(), loading: true, error: null, setError: jest.fn(),
    });

    await act(async () => { render(<AuthPage />); });

    expect(googleButton()).toBeDisabled();
    expect(screen.getByText("Accediendo...")).toBeInTheDocument();
  });

  it("reports initialization failure and keeps login disabled", async () => {
    authStateReady.mockRejectedValue(new Error("Firebase unavailable"));
    render(<AuthPage />);
    const { setError } = mockedUseAuth.mock.results[0].value;

    await waitFor(() => expect(setError).toHaveBeenCalledWith(
      "No se pudo inicializar la autenticación.",
    ));
    expect(googleButton()).toBeDisabled();
  });

  it("reports synchronous Firebase initialization errors", async () => {
    mockedGetAuth.mockImplementationOnce(() => { throw new Error("Invalid configuration"); });
    await act(async () => { render(<AuthPage />); });

    expect(mockedUseAuth.mock.results[0].value.setError).toHaveBeenCalledWith(
      "No se pudo inicializar la autenticación.",
    );
    expect(googleButton()).toBeDisabled();
  });

  it("ignores initialization errors after leaving the page", async () => {
    let rejectReady!: (error: Error) => void;
    authStateReady.mockReturnValue(new Promise<void>((_resolve, reject) => { rejectReady = reject; }));
    const { unmount } = render(<AuthPage />);
    const { setError } = mockedUseAuth.mock.results[0].value;
    unmount();

    await act(async () => { rejectReady(new Error("Firebase unavailable")); });

    expect(setError).not.toHaveBeenCalled();
  });

  it("enables login when initialization resolves under StrictMode", async () => {
    authStateReady.mockResolvedValue(undefined);
    await act(async () => { render(<StrictMode><AuthPage /></StrictMode>); });

    expect(googleButton()).toBeEnabled();
  });
});
