import * as invitationService from "../../../../src/presentation/group-invitation/services/invitation.service";

describe("invitation.service GitHub removal", () => {
  it("does not export a GitHub sign-in function", () => {
    expect(invitationService).not.toHaveProperty("signInInvitationWithGithub");
  });
});
