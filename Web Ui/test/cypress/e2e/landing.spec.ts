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

// Pruebas agregadas para la HU-10: eliminar el acceso con GitHub.
describe("HU-10: retirada de GitHub en las pantallas publicas", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Sesion anonima determinista; no requiere datos ni modifica el servidor.
    cy.intercept("GET", "**/user/me", { statusCode: 401, body: { message: "No autorizado" } });
  });

  it("mantiene el acceso desde la portada y solo ofrece Google", () => {
    cy.visit("/");
    // Esperar la portada cargada de forma diferida, igual que en la prueba existente.
    cy.contains("h1", "Todo para crear software", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Comienza ahora").scrollIntoView().click();
    cy.location("pathname").should("eq", "/login");
    cy.contains("button", /acced.*con google/i).should("be.visible").and("not.be.disabled");
    cy.contains("button", /github/i).should("not.exist");
    cy.get('[data-testid="GitHubIcon"]').should("not.exist");
  });

  for (const role of ["student", "teacher"]) {
    it(`ofrece Google sin GitHub en la invitacion de ${role}`, () => {
      cy.visit(`/invitation?groupid=90&type=${role}`);
      cy.contains("button", "Registrarse con Google").should("be.visible").and("not.be.disabled");
      cy.contains("button", /github/i).should("not.exist");
      cy.get('[data-testid="GitHubIcon"]').should("not.exist");
    });
  }
});

