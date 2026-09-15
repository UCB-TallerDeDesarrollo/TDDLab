export const PRACTICE_CREATED_EVENT = "practice-created";

export function dispatchPracticeCreatedEvent() {
  globalThis.dispatchEvent(new CustomEvent(PRACTICE_CREATED_EVENT));
}

export function addPracticeCreatedListener(listener: () => void) {
  const handler: EventListener = () => {
    listener();
  };

  globalThis.addEventListener(PRACTICE_CREATED_EVENT, handler);

  return () => {
    globalThis.removeEventListener(PRACTICE_CREATED_EVENT, handler);
  };
}
