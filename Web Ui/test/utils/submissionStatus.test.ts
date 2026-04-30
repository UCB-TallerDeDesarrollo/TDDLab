import { getSubmissionStatusLabel } from "../../src/utils/submissionStatus";

describe("submissionStatus", () => {
  describe("getSubmissionStatusLabel", () => {
    it("should return 'Pendiente' when status is undefined", () => {
      expect(getSubmissionStatusLabel(undefined)).toBe("Pendiente");
    });

    it("should return 'Pendiente' when status is empty string", () => {
      expect(getSubmissionStatusLabel("")).toBe("Pendiente");
    });

    it("should return 'Pendiente' for 'pending' status", () => {
      expect(getSubmissionStatusLabel("pending")).toBe("Pendiente");
    });

    it("should return 'En progreso' for 'in progress' status", () => {
      expect(getSubmissionStatusLabel("in progress")).toBe("En progreso");
    });

    it("should return 'Enviado' for 'delivered' status", () => {
      expect(getSubmissionStatusLabel("delivered")).toBe("Enviado");
    });

    it("should return the original status for unknown values", () => {
      expect(getSubmissionStatusLabel("cancelled")).toBe("cancelled");
    });

    it("should return the original status for arbitrary strings", () => {
      expect(getSubmissionStatusLabel("archived")).toBe("archived");
    });

    it("should be case-sensitive for unknown statuses", () => {
      expect(getSubmissionStatusLabel("Pending")).toBe("Pending");
    });

    it("should return original string for 'DELIVERED' (case mismatch)", () => {
      expect(getSubmissionStatusLabel("DELIVERED")).toBe("DELIVERED");
    });
  });
});
