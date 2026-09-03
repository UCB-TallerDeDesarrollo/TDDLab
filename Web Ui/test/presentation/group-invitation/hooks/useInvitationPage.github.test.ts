import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useInvitationPage } from "../../../../src/presentation/group-invitation/hooks/useInvitationPage";

jest.mock(
  "../../../../src/presentation/group-invitation/services/invitation.service",
  () => ({
    subscribeToInvitationAuth: jest.fn(() => () => {}),
    signInInvitationWithGoogle: jest.fn(),
    signInInvitationWithGithub: jest.fn(),
    signOutInvitationSession: jest.fn(),
    verifyInvitationPassword: jest.fn(),
    registerInvitationUser: jest.fn(),
  }),
);

describe("useInvitationPage GitHub removal", () => {
  it("does not expose a GitHub sign-up handler", () => {
    const { result } = renderHook(() => useInvitationPage(), {
      wrapper: MemoryRouter,
    });

    expect(result.current).not.toHaveProperty("handleSignUp");
  });
});
