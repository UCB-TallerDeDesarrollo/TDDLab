import {
  getDisplayStatus,
  redirectStudentToGraph,
  toDisplayDate,
} from "../../../../src/features/my-practices/services/practiceDetail.service";

jest.mock("../../../../src/utils/dateUtils", () => ({
  formatDate: jest.fn((value: string) => `formatted:${value}`),
}));

describe("practiceDetail.service", () => {
  describe("getDisplayStatus", () => {
    it("maps known states to display labels", () => {
      expect(getDisplayStatus("pending")).toBe("Pendiente");
      expect(getDisplayStatus("in progress")).toBe("En progreso");
      expect(getDisplayStatus("delivered")).toBe("Enviado");
    });

    it("returns pending label when state is undefined", () => {
      expect(getDisplayStatus(undefined)).toBe("Pendiente");
    });

    it("returns original state for unknown values", () => {
      expect(getDisplayStatus("custom")).toBe("custom");
    });
  });

  describe("toDisplayDate", () => {
    it("returns N/A for empty values", () => {
      expect(toDisplayDate(null)).toBe("N/A");
      expect(toDisplayDate(undefined)).toBe("N/A");
    });

    it("formats string date values", () => {
      expect(toDisplayDate("2024-01-01")).toBe("formatted:2024-01-01");
    });

    it("formats Date values using ISO representation", () => {
      const date = new Date("2024-01-01T00:00:00.000Z");
      expect(toDisplayDate(date)).toBe("formatted:2024-01-01T00:00:00.000Z");
    });
  });

  describe("redirectStudentToGraph", () => {
    it("navigates to graph route when link is valid", () => {
      const navigate = jest.fn();
      const onError = jest.fn();

      redirectStudentToGraph(
        "https://github.com/octocat/hello-world",
        10,
        navigate,
        onError
      );

      expect(onError).not.toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith({
        pathname: "/graph",
        search: "repoOwner=octocat&repoName=hello-world&submissionId=10",
      });
    });

    it("reports error when link is empty", () => {
      const navigate = jest.fn();
      const onError = jest.fn();

      redirectStudentToGraph("", 10, navigate, onError);

      expect(navigate).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith("No se encontro un link para esta tarea.");
    });

    it("reports error when link does not match github repo pattern", () => {
      const navigate = jest.fn();
      const onError = jest.fn();

      redirectStudentToGraph("https://example.com/repo", 10, navigate, onError);

      expect(navigate).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        "Link invalido, por favor ingrese un link valido."
      );
    });
  });
});
