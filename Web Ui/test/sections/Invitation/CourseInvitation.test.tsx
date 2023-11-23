import InvitationPage from "../../../src/sections/Invitation/InvitationPage";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn((_, func) => {
    func(null);
    return jest.fn();
  }),
  User: jest.fn(),
}));

// Mocking the firebaseConfig module
jest.mock("../../../src/firebaseConfig", () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});
describe("InvitationPage component", () => {
  it("Renders the Sign Up button", () => {
    const { getByText } = render(<InvitationPage />);
    const signUpButton = getByText("Registrarse");
    expect(signUpButton).toBeInTheDocument();
  });
});
