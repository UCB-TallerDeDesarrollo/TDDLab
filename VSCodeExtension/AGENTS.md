# Extension instructions

Inherits [the shared guide](../AGENTS.md).

## Architecture and dependency flow

`src/extension.ts` connects commands and providers. The extension has `application`, `domain`, `infrastructure`, and `presentation` directories. Existing ports include `TestRunnerPort` and `TerminalPort`; inspect their callers before introducing another runner or terminal adapter.

The registered `TDD.runTest` command calls `TerminalViewProvider.executeCommand('npm test')`. The provider depends on `TerminalPort` and delegates execution through that port; activation supplies `VSCodeTerminalRepository`, its infrastructure implementation.

`src/application/runTest/ExecuteTestCommand.ts` separately depends on `TestRunnerPort`; verify command wiring before treating it as the active execution path. Providers also contain coordination and filesystem behavior.

## Boundaries and reuse

- Distinguish the extension installation directory from the open user's workspace. `NpmRunTests` runs `npm run test` in the first workspace folder; it is different from running this extension's own test suite.
- Preserve command IDs, activation behavior, and webview message contracts when changing their implementation. Include lifecycle/cleanup or host checks when that behavior is affected.
- For mixed timeline-log issues or an event-format change, use the log-review skill and inspect both producers and consumers. A displayed PASS/FAIL line does not establish the complete persisted event contract.
- `resources/TDDLabBaseProject` is a Git submodule. When needed, inspect its revision, instructions, and writers; initialize it only for the task and preserve its tracked revision unless an update is intended.
- Keep generated `out/` and downloaded test-editor files out of the patch.

## Commands

Run from `VSCodeExtension/`. `.vscode-test.mjs` configures host tests; `jest.config.js` configures the separate Jest setup.

| Purpose | Command | Meaning |
| --- | --- | --- |
| Type check | `npx --no-install tsc --noEmit` | Installed TypeScript, no emitted extension |
| Compile | `npm run compile` | Emits `out/` |
| Lint | `npm run lint` | Existing ESLint configuration |
| Host tests | `npm test` | `pretest` compiles/lints, then `vscode-test` uses VS Code |

The separate Jest configuration excludes `src/test/`, where the host tests live. Use a Jest invocation only for tests and an installed Jest tool it actually supports. Do not pass Jest flags to `npm test`, or claim host validation from a Jest run.
