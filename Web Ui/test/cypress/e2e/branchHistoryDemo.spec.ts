describe("BL-02 branch history graph", () => {
  it("loads the real mock graph from /graph without requiring a user session", () => {
    cy.intercept("GET", "**/api/user/me", {
      statusCode: 401,
      body: { error: "Usuario no autenticado" },
    });
    cy.intercept("GET", "**/api/commentsSubmission/484", []);
    cy.intercept("GET", "**/api/TDDCycles/commits-history*", {
      statusCode: 500,
      body: { error: "The legacy GitHub history is not part of this demo." },
    });
    cy.intercept("GET", "**/api/TDDCycles/commit-cycles*", {
      statusCode: 500,
      body: { error: "The legacy GitHub history is not part of this demo." },
    });
    cy.intercept("GET", "https://api.github.com/users/equipo-tddlab", {
      statusCode: 200,
      body: { name: "TDDLab demo" },
    });
    cy.intercept("GET", "**/api/TDDCycles/branch-view*").as("branchHistory");

    cy.visit("/graph?repoOwner=equipo-tddlab&repoName=ejemplo-sprint4&submissionId=484");

    cy.get('[aria-label="Grafo de ramas y commits"]', { timeout: 20000 }).should("be.visible");
    cy.wait("@branchHistory").its("response.statusCode").should("eq", 200);
    cy.get("@branchHistory.all").should("have.length", 3);
    cy.get('[aria-label="Historial de commits por ramas"]').within(() => {
      cy.contains("main");
      cy.contains("rama-a");
      cy.contains("rama-b");
    });
  });
});
