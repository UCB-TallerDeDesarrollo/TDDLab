export const ASSIGNMENT_UPDATED_EVENT = "assignment-updated";

export function dispatchAssignmentUpdatedEvent() {
  globalThis.dispatchEvent(new CustomEvent(ASSIGNMENT_UPDATED_EVENT));
}

export function addAssignmentUpdatedListener(listener: () => void) {
  const handler: EventListener = () => {
    listener();
  };

  globalThis.addEventListener(ASSIGNMENT_UPDATED_EVENT, handler);

  return () => {
    globalThis.removeEventListener(ASSIGNMENT_UPDATED_EVENT, handler);
  };
}
