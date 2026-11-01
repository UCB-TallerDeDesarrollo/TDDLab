# Backend instructions

Inherits [the shared guide](../AGENTS.md).

## Architecture and dependency flow

The Express/TypeScript API wires routes in `src/app.ts`; `src/routes`, `src/controllers`, and feature modules under `src/modules` usually form route -> controller -> use case -> repository flows. Some use cases depend on concrete repositories and others on interfaces. Inspect the affected module before selecting its pattern.

For example, `src/modules/Groups/application/GroupUseCases/getGroupsUseCase.ts` imports and accepts the concrete `GroupRepository`. In contrast, `src/modules/TDDCycles/Application/getCommitHistoryUseCase.ts` accepts `IGithubRepository`. Follow the affected module's existing dependency pattern.

## Contracts and behavior

- Keep HTTP handling, feature behavior, and persistence in their existing layers.
- Trace a public payload change through callers, validation, controller, use case, persistence, and affected tests. Preserve public field names unless the task deliberately changes the contract.
- Role middleware alone does not establish record ownership. Use authenticated identity for record-level authorization.
- A narrowly requested field update should preserve unrelated submission fields, including status, lifecycle dates, and comments.
- Use parameterized SQL and the existing configuration modules. Mock PostgreSQL, Firebase, GitHub, and AI calls in unit tests. Inspect route-test setup before importing the application: `src/app.ts` starts a listener.

## Commands

Run from `server/`. The backend declares Node `24.x`, while current CI jobs also contain Node 20; report the runtime actually used.

| Purpose | Command | Meaning |
| --- | --- | --- |
| Development API | `npm run dev` | Starts the configured API and can contact configured services |
| Type check | `npx --no-install tsc --noEmit` | Uses the installed compiler |
| Focused unit test | `npm test -- --runInBand --coverage=false --runTestsByPath <test-file>` | Jest/Node; use the applicable existing test |
| Compile | `npm run tsc` | Emits `build/` |
| Start compiled API | `npm run start` | Requires compiled output and intended environment |

No backend lint script is declared. `jest.config.js` excludes `dist/` but can include compiled tests under `build/`; verify which suites actually ran before comparing counts or claiming source-test coverage.
