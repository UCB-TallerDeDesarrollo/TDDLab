---
name: tddlab-log-review
description: Review mixed TDDLab test-execution and commit logs, or assess compatibility of a proposed tdd_log.json event-format change. Use for recorded TDD data issues; ordinary UI styling and authentication changes do not need this workflow.
---

# Review TDDLab log evidence

Produce an evidence-based assessment of recorded events and affected data contracts. Use the supplied log, the current TDDLab source checkout when available, and the user's specific question. A source-only review can identify contracts and risks but cannot establish what a missing runtime log contained.

## Inspect the relevant evidence

- For event-shape or compatibility questions, read [the current contract reference](references/contracts.md) and verify the affected source files. It describes an observed checkout, not an exhaustive historical protocol.
- For a supplied log, establish whether it was obtained, parses, and has an array at the root. Preserve the original records and their positions. Keep a missing file, failed retrieval, empty array, commit-only array, and malformed data distinguishable in the assessment.
- Identify execution and commit records by their shape and field types. Zero passed tests is a valid value, not absence of a field. Report partial or ambiguous records; do not coerce them into valid events or silently discard them.
- Preserve recorded timestamps, success flags, counts, and IDs. A repeated `testId` may relate several events; verify the reader/writer association before regrouping. Report inconsistent values as evidence instead of correcting the input.
- Describe recorded executions separately from commit metrics, CI results, or coverage. If no executions are present in the supplied evidence, say that; do not conclude the student never ran tests or reconstruct missing runs from other sources.

## Trace only what the question needs

For a loading issue, inspect default-branch selection, URL construction, retrieval/error handling, and the relevant consumer. Do not assume `main` or erase slashes in a branch name.

For a format change, identify affected readers and writers across the frontend, API, extension, and base-project submodule as applicable. State uninspected producers explicitly. Propose compatibility handling and fixtures for relevant cases before changing a shared event contract.

## Report the result

Report the available evidence, valid event categories, anomalies or unknowns, affected consumers, and the next justified check. Distinguish a source hypothesis from a reproduced runtime failure.

Complete a review without modifying the log. If implementation is also authorized, continue only within that scope and use applicable component checks. Avoid contacting student repositories or configured services when local evidence suffices; repository-analysis endpoints can persist data.
