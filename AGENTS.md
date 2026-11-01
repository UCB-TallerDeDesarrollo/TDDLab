# TDDLab agent instructions

TDDLab supports academic assignments, practice submissions, repository analysis, and recorded TDD activity. Preserve the academic workflows and the meaning of recorded events.

Read the guides for the components affected by the task. Follow the user's scope and existing authorization, communicate in their language, and preserve interface copy unless the task changes it.

## Task map

| Task touches | Read |
| --- | --- |
| Screens, navigation, or frontend data access | [Web Ui/AGENTS.md](Web%20Ui/AGENTS.md) |
| API behavior, authorization, or persistence | [server/AGENTS.md](server/AGENTS.md) |
| Extension commands, terminal, or webviews | [VSCodeExtension/AGENTS.md](VSCodeExtension/AGENTS.md) |
| Mixed TDD logs or an event-format change | [.agents/skills/tddlab-log-review/SKILL.md](.agents/skills/tddlab-log-review/SKILL.md) |

## System map and architecture

Students, teachers, and administrators use the web app. The extension operates in a developer's VS Code workspace. External boundaries include PostgreSQL, Firebase, GitHub, and AI services.

| Component | Entry points | Observed organization |
| --- | --- | --- |
| Frontend | `Web Ui/src/main.tsx`, `Web Ui/src/App.tsx` | Presentation by feature, shared UI, and modules with use cases and repository contracts |
| API | `server/src/app.ts` | Express routes/middleware, controllers, use cases, and repositories; concrete and interface dependencies coexist |
| Extension | `VSCodeExtension/src/extension.ts` | Commands/providers and application, domain, infrastructure, and presentation areas |
| Base project | `.gitmodules` | Git submodule; inspect its source and instructions when a task needs it |

Architecture varies by module. Trace the affected flow and reuse suitable ports, adapters, and feature boundaries; domain/application folders alone do not establish uniform hexagonal architecture. For architectural changes, state the affected dependencies and acceptance criteria, and distinguish proposals from accepted team decisions.

## Working rules

- Inspect Git status and preserve pre-existing work. Locate existing services, components, and tests before adding implementations; keep changes within the requested scope.
- Current source, producers, consumers, and tests establish contracts. Package manifests, lockfiles, and tool configurations establish commands and mechanical conventions. Report discrepancies and update the affected guide when its documented behavior changes. Type annotations do not validate incoming JSON.
- Keep commits, recorded test executions, CI outcomes, and derived metrics distinct. Missing recordings do not establish that a student never ran tests. Never invent executions, identifiers, times, or results.
- For changed API writes, enforce role and record-level authorization on the server using authenticated identity. Resolve unclear product permissions before implementing dependent behavior.
- Keep credentials and generated artifacts out of the patch. Verify the environment before contacting shared services: repository-analysis GET requests can persist cache data.
- Necessary local setup and checks are within an authorized implementation task. Keep dependency changes scoped. External publication, deployment, shared-data changes, and Git publication need authorization covering those actions; use authorization already supplied.

## Verification and completion

Each application owns its manifest and lockfile; the root has no unified application build/test scripts. Run the affected component's commands. If dependencies are missing, use `npm ci` in that application with its lockfile. On Windows, use `npm.cmd` / `npx.cmd` if PowerShell shims are unavailable, and quote paths containing spaces.

Start with checks that exercise the change and broaden for affected shared contracts or unresolved failures. Use a focused regression for a behavioral fix when practical; do not weaken tests, typing, or lint to hide failures. Documentation changes need path, command, link, and diff checks.

Review the diff and report the result, checks actually performed, and material limitations. Historical results do not certify the current checkout.

## Skills

Project skills belong in `.agents/skills/<name>/SKILL.md`. Use them for repeated specialized workflows that match the task; keep general project rules in these guides. Add supporting resources only when needed, validate the skill, and exercise it on a representative task.

For the format, use the [Agent Skills specification](https://agentskills.io/specification) and [Codex skills documentation](https://learn.chatgpt.com/docs/build-skills).
