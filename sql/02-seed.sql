-- ============================================================
-- Datos de prueba para testing local
-- Se ejecuta automáticamente al levantar el contenedor
-- ============================================================

-- ============================================================
-- GROUPS (3 grupos)
-- ============================================================
INSERT INTO "groups" (groupname, groupdetail, creationdate) VALUES
  ('Grupo A', 'Grupo de Desarrollo', '2025-01-15'),
  ('Grupo B', 'Grupo de QA', '2025-02-01'),
  ('Grupo C', 'Grupo de DevOps', '2025-03-10')
ON CONFLICT DO NOTHING;

-- ============================================================
-- USERS (6 usuarios, diferentes roles y grupos)
-- ============================================================
INSERT INTO userstable (email, groupid, role) VALUES
  ('alice@test.com', 1, 'student'),
  ('bob@test.com', 1, 'teacher'),
  ('charlie@test.com', 2, 'student'),
  ('diana@test.com', 2, 'teacher'),
  ('eve@test.com', 3, 'student'),
  ('frank@test.com', 3, 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRACTICES (4 prácticas)
-- ============================================================
INSERT INTO practices (title, description, creation_date, state, userid) VALUES
  ('Práctica 1: TDD Básico', 'Introducción a TDD', '2025-04-01', 'in progress', 1),
  ('Práctica 2: Refactoring', 'Refactoring de código', '2025-04-05', 'pending', 1),
  ('Práctica 3: CI/CD', 'Pipeline de integración', '2025-04-10', 'delivered', 3),
  ('Práctica 4: Testing', 'Testing avanzado', '2025-04-15', 'in progress', 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ASSIGNMENTS (5 assignments)
-- ============================================================
INSERT INTO assignments (title, description, start_date, end_date, state, link, comment, groupid, practice_id) VALUES
  ('TP1: Test First', 'Desarrollar siguiendo TDD', '2025-04-01', '2025-04-15', 'in progress', 'https://github.com/test/tp1', 'En progreso', 1, '1'),
  ('TP2: Refactor', 'Refactorizar código legacy', '2025-04-05', '2025-04-20', 'pending', 'https://github.com/test/tp2', 'Pendiente', 1, '2'),
  ('TP3: CI Pipeline', 'Configurar CI', '2025-04-10', '2025-04-25', 'delivered', 'https://github.com/test/tp3', 'Entregado', 2, '3'),
  ('TP4: Testing Avanzado', 'Escribir tests de integración', '2025-04-12', '2025-04-28', 'in progress', 'https://github.com/test/tp4', 'En progreso', 2, '4'),
  ('TP5: Code Review', 'Review de código', '2025-04-18', '2025-05-01', 'pending', NULL, NULL, 3, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SUBMISSIONS (8 submissions)
-- ============================================================
INSERT INTO submissions (assignmentid, userid, status, repository_link, start_date, end_date, comment) VALUES
  (1, 1, 'in progress', 'https://github.com/alice/tp1', '2025-04-01', NULL, 'Trabajando'),
  (1, 3, 'pending', NULL, NULL, NULL, NULL),
  (2, 1, 'pending', NULL, NULL, NULL, NULL),
  (2, 3, 'in progress', 'https://github.com/charlie/tp2', '2025-04-06', NULL, 'En desarrollo'),
  (3, 3, 'delivered', 'https://github.com/charlie/tp3', '2025-04-10', '2025-04-20', 'Entregado a tiempo'),
  (3, 5, 'delivered', 'https://github.com/eve/tp3', '2025-04-11', '2025-04-21', 'Entregado'),
  (4, 5, 'in progress', 'https://github.com/eve/tp4', '2025-04-12', NULL, 'Escribiendo tests'),
  (5, 1, 'pending', NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRACTICE SUBMISSIONS (5 practice submissions)
-- ============================================================
INSERT INTO practicesubmissions (practiceid, userid, status, repository_link, start_date, end_date, comment) VALUES
  (1, 1, 'delivered', 'https://github.com/alice/p1', '2025-04-01', '2025-04-05', 'Completada'),
  (1, 3, 'delivered', 'https://github.com/charlie/p1', '2025-04-02', '2025-04-06', 'Completada'),
  (2, 1, 'in progress', 'https://github.com/alice/p2', '2025-04-06', NULL, 'En progreso'),
  (3, 3, 'in progress', 'https://github.com/charlie/p3', '2025-04-10', NULL, 'En progreso'),
  (4, 5, 'pending', NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TEACHER COMMENTS (4 comentarios)
-- ============================================================
INSERT INTO "teachercomments" (submission_id, teacher_id, content, created_at) VALUES
  (1, 2, 'Buen trabajo en el primer commit', '2025-04-02 10:00:00'),
  (5, 4, 'Excelente cobertura de tests', '2025-04-21 15:30:00'),
  (6, 4, 'Falta documentación', '2025-04-22 09:15:00'),
  (7, 2, 'Buen avance, sigue así', '2025-04-15 11:20:00')
ON CONFLICT DO NOTHING;

-- ============================================================
-- FEATURE FLAGS (5 flags)
-- ============================================================
INSERT INTO feature_flags (feature_name, is_enabled) VALUES
  ('new_dashboard', TRUE),
  ('beta_ai_assistant', TRUE),
  ('old_reports', FALSE),
  ('experimental_api', FALSE),
  ('maintenance_mode', FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PROMPTS IA (3 prompts)
-- ============================================================
INSERT INTO prompts_ia_temp_v2 (name, prompt) VALUES
  ('tdd_analysis', 'Eres un experto en TDD. Analiza el siguiente código y commit history.'),
  ('refactoring', 'Eres un experto en refactoring. Sugiere mejoras para el siguiente código.'),
  ('evaluation', 'Eres un evaluador de código. Califica la calidad del siguiente código basándote en TDD.')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TDD COMMITS (5 commits simulados)
-- ============================================================
INSERT INTO commitsTable (owner, repoName, html_url, sha, total, additions, deletions, message, url, comment_count, commit_date, coverage, test_count, tdd_cycle) VALUES
  ('test-owner', 'repo-tdd', 'https://github.com/test-owner/repo-tdd/commit/abc123', 'abc123', 10, 50, 20, 'feat: add failing test', 'https://github.com/test-owner/repo-tdd/commit/abc123', 0, '2025-04-01 10:00:00', '85%', '10', 'RojoVerde'),
  ('test-owner', 'repo-tdd', 'https://github.com/test-owner/repo-tdd/commit/def456', 'def456', 8, 30, 15, 'feat: make test pass', 'https://github.com/test-owner/repo-tdd/commit/def456', 0, '2025-04-01 10:05:00', '85%', '10', 'RojoVerde'),
  ('test-owner', 'repo-tdd', 'https://github.com/test-owner/repo-tdd/commit/ghi789', 'ghi789', 5, 20, 10, 'refactor: extract method', 'https://github.com/test-owner/repo-tdd/commit/ghi789', 0, '2025-04-01 10:10:00', '88%', '12', 'Verde'),
  ('test-owner', 'repo-tdd', 'https://github.com/test-owner/repo-tdd/commit/jkl012', 'jkl012', 12, 60, 25, 'feat: add new feature test', 'https://github.com/test-owner/repo-tdd/commit/jkl012', 0, '2025-04-02 14:00:00', '82%', '15', 'Rojo'),
  ('test-owner', 'repo-tdd', 'https://github.com/test-owner/repo-tdd/commit/mno345', 'mno345', 6, 25, 12, 'feat: implement feature', 'https://github.com/test-owner/repo-tdd/commit/mno345', 0, '2025-04-02 14:10:00', '90%', '18', 'RojoVerde')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TDD JOBS (3 jobs simulados)
-- ============================================================
INSERT INTO jobsTable (id, sha, owner, reponame, conclusion) VALUES
  (101, 'abc123', 'test-owner', 'repo-tdd', 'success'),
  (102, 'def456', 'test-owner', 'repo-tdd', 'success'),
  (103, 'ghi789', 'test-owner', 'repo-tdd', 'failure')
ON CONFLICT DO NOTHING;

-- ============================================================
-- COMMIT TIMELINE (8 entradas)
-- ============================================================
INSERT INTO commit_timeline (commit_sha, execution_timestamp, number_of_tests, passed_tests, color, repoOwner, repoName) VALUES
  ('abc123', '2025-04-01 10:00:00', 10, 3, 'red', 'test-owner', 'repo-tdd'),
  ('abc123', '2025-04-01 10:01:00', 10, 10, 'green', 'test-owner', 'repo-tdd'),
  ('def456', '2025-04-01 10:05:00', 12, 12, 'green', 'test-owner', 'repo-tdd'),
  ('ghi789', '2025-04-01 10:10:00', 12, 12, 'green', 'test-owner', 'repo-tdd'),
  ('jkl012', '2025-04-02 14:00:00', 15, 5, 'red', 'test-owner', 'repo-tdd'),
  ('jkl012', '2025-04-02 14:01:00', 15, 8, 'red', 'test-owner', 'repo-tdd'),
  ('mno345', '2025-04-02 14:10:00', 18, 18, 'green', 'test-owner', 'repo-tdd'),
  ('mno345', '2025-04-02 14:11:00', 18, 18, 'green', 'test-owner', 'repo-tdd')
ON CONFLICT DO NOTHING;
