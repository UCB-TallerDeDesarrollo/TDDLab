# Observed event contract and source entry points

Inspected on 2026-10-07 at TDDLab source commit `cd318f59547ab0f47a1b4e95b6340a1b610b3d79`. Source paths below are relative to the TDDLab repository root.

## Frontend declaration

`Web Ui/src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces.ts` declares a union of:

| Category | Declared fields |
| --- | --- |
| Test execution | `numPassedTests: number`, `failedTests: number`, `numTotalTests: number`, `timestamp: number`, `success: boolean`, `testId: number` |
| Commit | `commitId: string`, `commitName: string`, `commitTimestamp: number`, `testId: number` |

These types do not validate incoming JSON. For comparison with this declaration, inspect field presence/types and finite counts/times; count/flag contradictions deserve a separate finding. A number may be zero. Historical runtime variants must be confirmed from their producer or a demonstrated compatible reader before declaring them supported or invalid for every version.

## Readers and retrieval

- `Web Ui/src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter.ts` obtains repository `default_branch`, builds the raw log URL using encoded branch text, and maps a 404 to an empty array. Once that mapping has occurred, an empty returned array alone cannot distinguish a missing file from an empty file.
- `Web Ui/src/presentation/tdd-visualization/services/tddVisualization.service.ts` coordinates log, commit, and classification requests. Some error state is coupled; inspect the actual relevant path before attributing a chart failure solely to log availability.
- `Web Ui/src/presentation/tdd-visualization/components/TDDLineChart.tsx` and `TDDCycleChart.tsx` consume execution fields. Inspect whichever consumer the task affects.
- `VSCodeExtension/src/application/timeline/repository/TimelineRepository.ts` first recognizes executions through defined count fields, then commits through truthy ID/time fields. Recognition alone is weaker than full contract validation.
- `server/src/controllers/TDDCycles/TDDCyclesController.ts` consumes log data and can update/save derived persistence. Do not call it as a harmless parser during a read-only review.

## Producers and association limits

The base project at `VSCodeExtension/resources/TDDLabBaseProject` is a submodule. Its internal recording scripts were not inspected in that source snapshot. Search applicable extension/base-project producers when assessing a format change; do not claim writer compatibility from the frontend type alone. Verify how `testId`, commit IDs, and timestamps are associated before regrouping; different record arrays need not share positions.
