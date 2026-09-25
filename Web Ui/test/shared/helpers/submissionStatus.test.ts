import {
  isSubmissionInProgress,
  normalizeSubmissionStatus,
  resolveSubmissionAction,
} from "../../../src/shared/helpers/submissionStatus";

describe("submissionStatus", () => {
  describe("normalizeSubmissionStatus", () => {
    it("maps the pending status", () => {
      expect(normalizeSubmissionStatus("pending")).toBe("pending");
    });

    it("maps the in progress status", () => {
      expect(normalizeSubmissionStatus("in progress")).toBe("in progress");
    });

    it("maps the delivered status", () => {
      expect(normalizeSubmissionStatus("delivered")).toBe("delivered");
    });

    it("treats an undefined status (no submission yet) as pending", () => {
      expect(normalizeSubmissionStatus(undefined)).toBe("pending");
    });

    it("treats an unknown status as pending", () => {
      expect(normalizeSubmissionStatus("unexpected")).toBe("pending");
    });
  });

  describe("resolveSubmissionAction", () => {
    it("requires start for a pending submission", () => {
      expect(resolveSubmissionAction("pending")).toBe("start");
    });

    it("requires finish for an in progress submission", () => {
      expect(resolveSubmissionAction("in progress")).toBe("finish");
    });

    it("requires none for a delivered (finalized) submission", () => {
      expect(resolveSubmissionAction("delivered")).toBe("none");
    });

    it("requires start when there is no submission yet", () => {
      expect(resolveSubmissionAction(undefined)).toBe("start");
    });
  });

  describe("isSubmissionInProgress", () => {
    it("is true only for in progress", () => {
      expect(isSubmissionInProgress("in progress")).toBe(true);
      expect(isSubmissionInProgress("pending")).toBe(false);
      expect(isSubmissionInProgress("delivered")).toBe(false);
      expect(isSubmissionInProgress(undefined)).toBe(false);
    });
  });
});
