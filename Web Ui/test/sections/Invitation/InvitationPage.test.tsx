import InvitationPage from "../../../src/sections/Invitation/InvitationPage";
import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { handleSignInWithGitHub } from "../../../src/modules/Users-Authentication/application/signInWithGithub";
import { mockUserCredential } from "../../modules/__mocks__/Auth/mockedUserCredential";
import { RegisterUserOnDb } from "../../../src/modules/Users-Authentication/application/registerUserOnDb";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn((_, func) => {
    func(null);
    return jest.fn();
  }),
  User: jest.fn(),
}));
jest.mock("../../../src/modules/Auth/application/signInWithGithub", () => ({
  handleSignInWithGitHub: jest.fn(),
}));
jest.mock("../../../src/firebaseConfig", () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});
jest.mock("../../../src/modules/Auth/application/registerUserOnDb", () => {
  return {
    RegisterUserOnDb: jest.fn().mockImplementation(() => ({
      register: jest.fn().mockResolvedValue(undefined),
    })),
  };
});
describe("InvitationPage component", () => {
  beforeEach(() => {
    const mockedUser = mockUserCredential.user;
    (
      handleSignInWithGitHub as jest.MockedFunction<
        typeof handleSignInWithGitHub
      >
    ).mockResolvedValue(mockedUser);
  });
  it("Renders the Sign Up button and press it", async () => {
    const { getByText } = render(<InvitationPage />);
    const signUpButton = getByText("Registrarse");

    fireEvent.click(signUpButton);
    expect(RegisterUserOnDb).toHaveBeenCalledTimes(1);
    expect(signUpButton).toBeInTheDocument();
    expect(handleSignInWithGitHub).toHaveBeenCalled();
    await waitFor(() => {
      const acceptButton = getByText("Aceptar invitación al curso");
      fireEvent.click(acceptButton);
      expect(acceptButton).toBeInTheDocument();
    });
  });
});
