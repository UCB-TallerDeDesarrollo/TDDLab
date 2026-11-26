
require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.BRANCH_SUPPORT_DATABASE_URL,
  connectionTimeoutMillis: 15000,
});

async function main() {
  try {
    console.log("Verificando repositorio TDDLab...");

    const projects = await pool.query(`
      SELECT *
      FROM project
      LIMIT 5
    `);

    console.log("\nProyectos registrados:");
    console.table(projects.rows);

    const counts = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM project) AS proyectos,
        (SELECT COUNT(*) FROM branch) AS ramas,
        (SELECT COUNT(*) FROM git_commit) AS commits,
        (SELECT COUNT(*) FROM test_execution) AS ejecuciones
    `);

    console.log("\nRegistros disponibles:");
    console.table(counts.rows);

  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

main();
