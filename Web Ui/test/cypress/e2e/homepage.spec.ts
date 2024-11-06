describe("tddLab main page", () => {
  it("Debería visualizar la página principal de tddlab para loguearse", () => {
    cy.visit("https://tddlab-hosting-firebase.web.app/");

    cy.contains(
      "¡Bienvenido a TDDLab!, usa tu cuenta de GitHub para acceder:"
    ).should("be.visible");

    cy.get("button").contains("Accede con GitHub").should("be.visible");
  });
});
