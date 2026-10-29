# Frontend instructions

Inherits [the shared guide](../AGENTS.md).

## Architecture and dependency flow

The React/TypeScript/Vite app is organized by presentation feature, shared UI, and domain/data modules. Routes are assembled in `src/App.tsx`; navigation lives in `src/app/navigation`.

The Groups flow is a concrete example: `src/presentation/groups/services/groupsService.ts` constructs a `GroupsRepository` and passes it to `GetGroups`. That use case depends on `GroupsRepositoryInterface`; the repository implements the interface and calls the API through Axios. Inspect `src/modules/Groups/application/GetGroups.ts` and `src/modules/Groups/repository/GroupsRepository.ts` for the actual boundary.

Direct HTTP calls also exist in presentation or application code, including `SuccessfulEnrollmentPopUp.tsx` and authentication session helpers. Trace the affected feature's actual flow; keep architectural migration scoped to the task.

## Placement and reuse

Use `src/presentation/<feature>/` for pages, visual components, hooks, services, and feature types. Use `src/modules` for existing domain/use-case/repository integration.

Check `src/shared` before adding recurring UI. Useful entry points include `ContentState` for loading/empty/error views, `ValidationDialog`, `ConfirmationDialog`, `FeedbackSnackbar`, and `StatefulButton`. Inspect their props and callers to decide whether they fit; shared placement does not make a component suitable for every screen.

## Behavioral checks

- For shared UI changes, identify the affected student, teacher, and administrator flows and the assignment/practice consumers that actually use it.
- Deliberately handle loading, empty, failure, and success states. Verify disabled/submitting behavior, accessible labels, and preservation of input after a failed save.
- For recorded test-execution or mixed-log issues, use the log-review skill. Fetch the repository's default branch from metadata; preserve the distinction between unavailable log data and commit data.
- Use the existing API configuration (`config.ts`) and authentication integration. Preserve credentialed requests where required. Treat client-visible configuration as public to the browser.

## Commands

Run from `Web Ui/`.

| Purpose | Command | Meaning |
| --- | --- | --- |
| Development UI | `npm run dev` | Starts Vite |
| Type check | `npx --no-install tsc --noEmit` | Uses installed TypeScript; no bundle build |
| Lint | `npm run lint` | Existing ESLint configuration, zero warnings required by the script |
| Focused unit test | `npm test -- --runInBand --coverage=false --runTestsByPath <test-file>` | Jest/jsdom; substitute an existing test path |
| Build | `npm run build` | TypeScript plus Vite; produces build artifacts |
| End-to-end | `npm run cy:run` | Cypress; requires the intended services and test environment |

Use a mock for external HTTP and authentication in unit tests. Select a build or browser check when the change needs that evidence; a passing unit test alone does not establish rendering or end-to-end behavior.
