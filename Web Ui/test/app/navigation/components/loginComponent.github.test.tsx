import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import LoginComponent from "../../../../src/app/navigation/components/loginComponent";
import { setGlobalState } from "../../../../src/modules/User-Authentication/domain/authStates";
import * as signOut from "../../../../src/modules/User-Authentication/application/signOut";

jest.mock("../../../../src/modules/User-Authentication/application/signOut", () => ({
  handleSignOut: jest.fn(),
}));

describe("LoginComponent logout", () => {
  beforeEach(() => {
    (signOut.handleSignOut as jest.Mock).mockResolvedValue(undefined);
    setGlobalState("authData", {
      userid: 1,
      userProfilePic: "",
      userEmail: "user@example.com",
      usergroupid: 1,
      userRole: "student",
    });
  });

  it("signs out with the generic sign-out handler on logout", async () => {
    render(
      <MemoryRouter>
        <LoginComponent />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click(screen.getByRole("menuitem", { name: /salir/i }));

    await waitFor(() => {
      expect(signOut.handleSignOut).toHaveBeenCalled();
    });
  });
});
