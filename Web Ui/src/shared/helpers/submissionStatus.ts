export type SubmissionStatus = "pending" | "in progress" | "delivered";

export type SubmissionAction = "start" | "finish" | "none";

/*
 * Business rule of the submission lifecycle: a submission only exists in
 * three statuses and each one exposes at most one primary action.
 *
 *   pending  -> start  (the student/teacher starts the task or practice)
 *   in progress -> finish (the submission is delivered)
 *   delivered -> none  (terminal state: no valid transition is offered)
 *
 * Centralised here so both "Mis Tareas" and "Mis Prácticas" share the same
 * rule, keeping the domain logic in a single, tested place.
 */
export function normalizeSubmissionStatus(
  status: string | undefined
): SubmissionStatus {
  switch (status) {
    case "in progress":
      return "in progress";
    case "delivered":
      return "delivered";
    case "pending":
    case undefined:
    case "":
      return "pending";
    default:
      return "pending";
  }
}

export function resolveSubmissionAction(
  status: string | undefined
): SubmissionAction {
  switch (normalizeSubmissionStatus(status)) {
    case "in progress":
      return "finish";
    case "delivered":
      return "none";
    case "pending":
    default:
      return "start";
  }
}

export function isSubmissionInProgress(
  status: string | undefined
): boolean {
  return normalizeSubmissionStatus(status) === "in progress";
}
