// The real app runs against intercepted API responses; no production data is changed.
describe('HU-02: botón único de tareas', () => {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    it(`starts, finishes and reloads with the correct action and color at ${viewport.width}px`, () => {
      cy.viewport(viewport.width, viewport.height);
      const started = {
        id: 42, assignmentid: 7, userid: 9, status: 'in progress',
        repository_link: 'https://github.com/student/task',
        start_date: '2026-09-23', end_date: null as string | null, comment: null as string | null,
      };
      let saved: typeof started | null = null;

      cy.intercept('GET', '**/user/me', {
        id: 9, email: 'student@example.test', groupid: 1, role: 'student',
      });
      cy.intercept('GET', '**/assignments/7', {
        id: 7, title: 'Tarea de TDD', description: 'Practicar TDD', groupid: 1,
        start_date: '2026-09-23', end_date: '2026-09-30',
      });
      cy.intercept('GET', '**/groups/1', { id: 1, groupName: 'Grupo A' });
      cy.intercept('GET', '**/featureflags/name/*', { is_enabled: false });
      cy.intercept('GET', '**/submissions/7/9', (req) => {
        req.reply(saved ? { statusCode: 200, body: saved }
          : { statusCode: 404, body: { message: 'Submission not found' } });
      }).as('readSubmission');
      cy.intercept('POST', '**/submissions', (req) => {
        saved = { ...started, ...req.body };
        req.reply({ statusCode: 201, body: saved });
      }).as('startSubmission');
      cy.intercept('PUT', '**/submissions/42', (req) => {
        saved = { ...started, ...req.body };
        req.reply({ statusCode: 200, body: saved });
      }).as('finishSubmission');

      cy.visit('/assignment/7');
      cy.wait('@readSubmission');
      cy.contains('button', 'Iniciar tarea').should('be.visible');
      cy.contains('button', 'Finalizar tarea').should('not.exist');
      cy.get('[role="status"]').should('contain.text', 'Pendiente')
        .and('have.css', 'background-color', 'rgb(243, 244, 246)');
      cy.get('.assignment-student-actions').children().first().should('have.text', 'Iniciar tarea');
      cy.contains('button', 'Iniciar tarea').click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('input').type(started.repository_link);
        cy.contains('button', 'Enviar').click();
      });
      cy.wait('@startSubmission').its('request.body.status').should('eq', 'in progress');
      cy.contains('button', 'Iniciar tarea').should('not.exist');
      cy.get('.assignment-student-actions').children().first().should('have.text', 'Finalizar tarea');
      cy.get('[role="status"]').should('contain.text', 'En progreso')
        .and('have.css', 'background-color', 'rgb(254, 243, 199)');
      cy.screenshot(`hu02-progress-${viewport.width}`, { capture: 'viewport' });

      cy.reload();
      cy.wait('@readSubmission');
      cy.contains('button', 'Finalizar tarea').should('be.visible').click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('#comment').type('Listo');
        cy.contains('button', 'Enviar').click();
      });
      cy.wait('@finishSubmission').its('request.body.status').should('eq', 'delivered');
      cy.contains('button', 'Iniciar tarea').should('not.exist');
      cy.contains('button', 'Finalizar tarea').should('not.exist');
      cy.get('[role="status"]').should('contain.text', 'Finalizado')
        .and('have.css', 'background-color', 'rgb(220, 252, 231)');

      cy.reload();
      cy.wait('@readSubmission');
      cy.get('[role="status"]').should('contain.text', 'Finalizado')
        .and('have.css', 'background-color', 'rgb(220, 252, 231)');
      cy.contains('button', 'Iniciar tarea').should('not.exist');
      cy.contains('button', 'Finalizar tarea').should('not.exist');
      cy.screenshot(`hu02-finished-${viewport.width}`, { capture: 'viewport' });
    });
  }
});
