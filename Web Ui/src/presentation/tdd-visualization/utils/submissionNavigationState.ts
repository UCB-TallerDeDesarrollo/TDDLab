import { Submission } from "../types/tddVisualization.types";

const SUBMISSIONS_STORAGE_KEY = "tddlabGraphSubmissions";

export function saveGraphSubmissions(submissions: Submission[]) {
  try {
    sessionStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
  } catch (error) {
    console.error("Error saving graph submissions:", error);
  }
}

export function loadGraphSubmissions(): Submission[] {
  try {
    const storedSubmissions = sessionStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!storedSubmissions) {
      return [];
    }

    const submissions = JSON.parse(storedSubmissions) as unknown;
    return Array.isArray(submissions) ? (submissions as Submission[]) : [];
  } catch (error) {
    console.error("Error loading graph submissions:", error);
    return [];
  }
}
