describe('Assignment Manager Form Display', () => {
  it('should display the form when triggered by Assignments component', () => {
    // Asegúrate de que Cypress espere a que la aplicación se cargue completamente
    cy.visit('/', { timeout: 10000 });

    // Espera a que el elemento esté presente antes de realizar la acción
    cy.get('[data-testid=AssignmentsContainer]').should('be.visible');
    
    cy.get('[data-testid=FormsContainer]').should('be.visible');
  });
});
