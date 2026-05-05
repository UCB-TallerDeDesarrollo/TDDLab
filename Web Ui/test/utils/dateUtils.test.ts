import { formatDate } from "../../src/utils/dateUtils";

describe("dateUtils", () => {
  describe("formatDate", () => {
    it("should format a full ISO date string to dd/MM/yyyy", () => {
      expect(formatDate("2023-10-31T14:30:00Z")).toBe("31/10/2023");
    });

    it("should format a date-only string (yyyy-MM-dd)", () => {
      expect(formatDate("2024-01-15")).toBe("15/01/2024");
    });

    it("should handle single-digit day and month", () => {
      expect(formatDate("2023-02-05T00:00:00")).toBe("05/02/2023");
    });

    it("should handle date with time portion separated by space", () => {
      expect(formatDate("2023-12-25 08:00:00")).toBe("25/12/2023");
    });

    it("should handle end-of-year date", () => {
      expect(formatDate("2025-12-31T23:59:59Z")).toBe("31/12/2025");
    });

    it("should handle beginning-of-year date", () => {
      expect(formatDate("2020-01-01")).toBe("01/01/2020");
    });
  });
});
