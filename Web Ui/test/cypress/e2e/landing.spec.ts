describe("Landing page", () => {
  it("is publicly accessible and exposes the authentication flow", () => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit("/");

    cy.contains("h1", "Todo para crear software", { timeout: 10000 }).should(
      "be.visible",
    );
    cy.contains("button", "Comienza ahora").scrollIntoView().should("be.visible").click();
    cy.location("pathname").should("eq", "/login");
  });
});

