describe("Dashboard Git principal", () => {
  it("muestra el grafo antes de las métricas y permite seleccionar ramas", () => {
    cy.intercept("GET", "**/api/user/me", { body: { id: 1, email: "demo@example.test", groupid: 1, role: "student" } });
    cy.visit("/graph?fake=true&repoOwner=tddlab-demo&repoName=branches-demo", {
      onBeforeLoad(win) { win.localStorage.setItem("selectedMetric", "Dashboard"); },
    });
    cy.contains("h1", "Dashboard TDD").should("be.visible");
    cy.get(".tdd-branch-rail").should("be.visible");
    cy.get("[data-rail-commit]").should("have.length", 12);
    cy.get(".tdd-branch-rail path[data-parent]").should("have.length.greaterThan", 11);
    cy.get(".tdd-branch-rail").then(($rail) => {
      cy.get(".tdd-dashboard-overview").then(($metrics) => {
        cy.wrap($rail[0].getBoundingClientRect().top).should("be.lessThan", $metrics[0].getBoundingClientRect().top);
      });
    });
    cy.get('[data-rail-active="false"]').should("exist");
    cy.contains("button", "Todas las ramas").click();
    cy.get('[data-rail-active="false"]').should("not.exist");
    cy.screenshot("dashboard-git-principal", { capture: "viewport" });
  });
});
