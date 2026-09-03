import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import CheckRegisterGroupPopUp from "../../../../src/presentation/group-invitation/components/CheckRegisterGroupPopUp";
import * as signInWithGoogle from "../../../../src/modules/User-Authentication/application/signInWithGoogle";

jest.mock("../../../../src/modules/User-Authentication/application/signInWithGoogle", () => ({
  handleSignInWithGoogle: jest.fn(),
}));

describe("CheckRegisterGroupPopUp", () => {
  beforeEach(() => {
    (signInWithGoogle.handleSignInWithGoogle as jest.Mock).mockResolvedValue(
      undefined,
    );
    window.alert = jest.fn();
  });

  it("signs in with Google (not GitHub) when the popup is accepted", async () => {
    render(
      <MemoryRouter>
        <CheckRegisterGroupPopUp />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /aceptar/i }));

    await waitFor(() => {
      expect(signInWithGoogle.handleSignInWithGoogle).toHaveBeenCalled();
    });
  });
});
