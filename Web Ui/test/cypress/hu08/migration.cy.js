const api = 'http://127.0.0.1:3008/api/TDDCycles';
let payload;
describe('HU08 JSON PostgreSQL HTTP fetch y vista real', () => {
  before(() => {
    cy.readFile('../docs/hu08/fixtures/ingest-payload.json').then(value => { payload = value; });
    cy.task('executeProbeTests', null, { timeout: 120000 }).then(results => {
      expect(results).to.deep.equal([
        { name: 'passed', exitCode: 0, passed: 2, failed: 0, total: 2 },
        { name: 'failed', exitCode: 1, passed: 1, failed: 1, total: 2 },
        { name: 'without-tests', exitCode: 0, passed: 0, failed: 0, total: 0 },
      ]);
    });
  });
  beforeEach(() => {
    // Unrelated comments are isolated; all TDD migration HTTP calls hit the real backend.
    cy.intercept('GET', '**/commentsSubmission/**', { statusCode: 200, body: [] });
  });
  it('ejecuta pruebas registra consulta y compara cada bloque con JSON y SELECT', () => {
    cy.request('POST', `${api}/ingest-logs`, payload).its('status').should('eq', 200);
    payload.commitHistory.forEach(commit => {
      cy.request({ method: 'POST', url: `${api}/jobs`, body: { sha: commit.sha, owner: payload.repoOwner, reponame: payload.repoName, conclusion: commit.conclusion, branch: payload.branch } }).its('status').should('be.oneOf', [200, 201]);
    });
    cy.task('databaseSnapshot').then(database => {
      expect(database.snapshots).to.have.length(1);
      expect(database.snapshots[0].commit_history).to.deep.equal(payload.commitHistory);
      expect(database.snapshots[0].tdd_log).to.deep.equal(payload.tddLog);
      expect(database.jobs).to.have.length(3);
    });
    cy.intercept('GET', `${api}/commits-history*`).as('history');
    cy.visit('/test/manual/hu08-migration.html');
    cy.wait('@history').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.have.length(3);
      payload.commitHistory.forEach(source => {
        const actual = response.body.find(commit => commit.sha === source.sha);
        ['test_count', 'coverage', 'conclusion'].forEach(field => expect(actual[field]).to.deep.equal(source[field]));
        expect(actual.stats).to.deep.equal(source.stats);
        expect(actual.commit.message).to.eq(source.commit.message);
      });
    });
    cy.get('.cycleCardContainer').should('have.length', 3);
    payload.commitHistory.forEach((commit, index) => {
      const date = new Date(commit.commit.date).toLocaleString('es-ES', { hour12: false, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      cy.get('.cycleCardWrapper').eq(index).find('.dateCard').should('contain', date);
      cy.get('.cycleCardContainer').eq(index).within(() => {
        cy.contains(`Commit: ${commit.commit.message}`).should('be.visible');
        cy.contains('Total de modificaciones:').parent().should('contain', commit.stats.total);
        cy.contains('Adiciones:').parent().should('contain', commit.stats.additions);
        cy.contains('Sustracciones:').parent().should('contain', commit.stats.deletions);
        cy.contains('Cobertura:').parent().should('contain', `${commit.coverage}%`);
        cy.contains('Número de Tests:').parent().should('contain', commit.test_count || 'Sin tests');
        cy.contains(['Resultado: Exitoso', 'Resultado: Fallido', 'Resultado: Sin tests'][index]).should('be.visible');
        cy.contains('Ver commit').should('have.attr', 'href', commit.commit.url);
      });
      cy.get('.cycleCardWrapper').eq(index).screenshot(`01${['a-aprobados', 'b-fallidos', 'c-sin-tests'][index]}`);
    });
    cy.screenshot('01-tres-casos-postgresql', { capture: 'fullPage' });
  });
  it('reenvía el commit y el par de logs sin agregar registros', () => {
    cy.request('POST', `${api}/ingest-logs`, payload).its('status').should('eq', 200);
    const commit = payload.commitHistory[0];
    cy.request('POST', `${api}/jobs`, { sha: commit.sha, owner: payload.repoOwner, reponame: payload.repoName, conclusion: commit.conclusion, branch: payload.branch }).its('body').should('deep.equal', { status: 'duplicate' });
    cy.task('databaseSnapshot').then(database => {
      expect(database.snapshots).to.have.length(1);
      expect(database.jobs).to.have.length(3);
      expect(database.snapshots[0].commit_history).to.deep.equal(payload.commitHistory);
    });
    cy.visit('/test/manual/hu08-migration.html?role=teacher');
    cy.get('.cycleCardContainer').should('have.length', 3);
    cy.screenshot('02-reenvio-vista-docente', { capture: 'fullPage' });
  });
  it('muestra carga mientras la respuesta está pendiente', () => {
    cy.intercept('GET', `${api}/commits-history*`, request => { request.on('response', response => response.setDelay(2500)); }).as('delayedHistory');
    cy.visit('/test/manual/hu08-migration.html');
    cy.get('[role="status"][aria-label="Cargando datos del repositorio"]').should('be.visible');
    // PropagateLoader uses a zero-sized positioning span; its dots carry the pixels.
    cy.get('[data-testid=loading-spinner] span').filter(':visible').should('have.length.greaterThan', 0);
    cy.screenshot('03-cargando');
    cy.wait('@delayedHistory');
    cy.get('.cycleCardContainer').should('have.length', 3);
  });
  it('muestra lista vacía consultada en PostgreSQL', () => {
    cy.visit('/test/manual/hu08-migration.html?repo=empty-migration');
    cy.get('[data-testid=emptyMessage]').should('be.visible').and('contain', 'No hay commits');
    cy.screenshot('04-lista-vacia');
  });
  it('presenta un error controlado ante HTTP 500 sin romper la página', () => {
    cy.intercept('GET', `${api}/commits-history*`, { statusCode: 500, body: { error: 'Server error' } });
    cy.visit('/test/manual/hu08-migration.html');
    cy.get('[data-testid=errorMessage]').should('be.visible').and('contain', 'No se pudieron cargar');
    cy.get('.cycleCardContainer').should('not.exist');
    cy.screenshot('05-error-backend');
  });
  [
    ['Luiscuac-TotalizadorVentasIngSoftware', 'reference-totalizador', 13, '06-referencia-totalizador'],
    ['HenryRiveraM-fizzbuzz', 'reference-fizzbuzz', 5, '07-referencia-fizzbuzz'],
    ['RashLop-TennisPlay', 'reference-tennis', 9, '08-referencia-tennis'],
  ].forEach(([file, repoName, count, screenshot]) => {
    it(`compara el historial real de ${file} con PostgreSQL y cada bloque`, () => {
      cy.readFile('../docs/hu08/evidence/references/reference-check.json').then(manifest => {
        const ref = manifest.results.find(item => item.files.some(entry => entry.localFile === `${file}-commit-history.json`));
        cy.readFile(`../docs/hu08/evidence/references/${file}-commit-history.json`).then(commitHistory => {
          const submit = tddLog => {
            const body = { repoOwner: 'hu08', repoName, branch: 'main', sha: ref.ref, commitHistory, tddLog };
            cy.request('POST', `${api}/ingest-logs`, body).its('status').should('eq', 200);
            cy.visit(`/test/manual/hu08-migration.html?repo=${repoName}`);
            cy.get('.cycleCardContainer').should('have.length', count);
            [...commitHistory].sort((a, b) => Date.parse(a.commit.date) - Date.parse(b.commit.date)).forEach((commit, index) => {
              cy.get('.cycleCardContainer').eq(index).within(() => {
                cy.contains(`Commit: ${commit.commit.message}`).should('exist');
                cy.contains('Total de modificaciones:').parent().should('contain', commit.stats.total);
                cy.contains('Cobertura:').parent().should('contain', `${commit.coverage}%`);
                cy.contains('Número de Tests:').parent().should('contain', commit.test_count || 'Sin tests');
              });
            });
            cy.screenshot(screenshot, { capture: 'viewport' });
          };
          if (file.startsWith('Luiscuac')) cy.readFile(`../docs/hu08/evidence/references/${file}-tdd_log.json`).then(submit);
          else submit([]); // Source repository has no tdd_log.json (HTTP 404 in manifest).
        });
      });
    });
  });
});
