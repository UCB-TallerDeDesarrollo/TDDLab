import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginComponent from "../../../src/app/navigation/components/loginComponent";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: () => [
    {
      userid: -1,
      userProfilePic: "",
      userEmail: "",
      usergroupid: -1,
      userRole: "",
    },
  ],
  setGlobalState: jest.fn(),
}));

describe("LoginComponent", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("navigates to the login page when an unauthenticated user clicks log in", () => {
    render(<LoginComponent />);

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
