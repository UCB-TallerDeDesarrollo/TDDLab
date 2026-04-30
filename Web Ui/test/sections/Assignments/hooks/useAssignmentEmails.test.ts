import { renderHook, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useAssignmentEmails } from "../../../src/sections/Assignments/hooks/useAssignmentEmails";
import UsersRepository from "../../../src/modules/Users/repository/UsersRepository";
import type { SubmissionDataObject } from "../../../src/modules/Submissions/Domain/submissionInterfaces";

jest.mock("../../../src/modules/Users/repository/UsersRepository");

const mockGetUserById = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (UsersRepository as jest.Mock).mockImplementation(() => ({
    getUserById: mockGetUserById,
  }));
});

const createSubmission = (id: number, userid: number): SubmissionDataObject => ({
  id,
  assignmentid: 1,
  userid,
  status: "in progress",
  repository_link: "https://github.com/test/repo",
  start_date: new Date(),
  end_date: new Date(),
  comment: "",
});

describe("useAssignmentEmails", () => {
  describe("initial state", () => {
    it("debería inicializar con studentEmails vacío", () => {
      const { result } = renderHook(() => useAssignmentEmails([]));

      expect(result.current.studentEmails).toEqual({});
    });
  });

  describe("success path", () => {
    it("debería cargar emails para submissions con userid no cacheado", async () => {
      const submissions = [
        createSubmission(1, 101),
        createSubmission(2, 102),
      ];

      mockGetUserById.mockImplementation((id: number) => {
        if (id === 101) return Promise.resolve({ id: 101, email: "student101@test.com", groupid: 1, role: "student" });
        if (id === 102) return Promise.resolve({ id: 102, email: "student102@test.com", groupid: 1, role: "student" });
        return Promise.reject(new Error("Not found"));
      });

      const { result } = renderHook(() => useAssignmentEmails(submissions));

      await waitFor(() => {
        expect(result.current.studentEmails[101]).toBe("student101@test.com");
        expect(result.current.studentEmails[102]).toBe("student102@test.com");
      });

      expect(mockGetUserById).toHaveBeenCalledTimes(2);
      expect(mockGetUserById).toHaveBeenCalledWith(101);
      expect(mockGetUserById).toHaveBeenCalledWith(102);
    });

    it("NO debería llamar a getUserById si los emails ya están en caché", async () => {
      const submissions = [createSubmission(1, 101)];

      mockGetUserById.mockResolvedValue({ id: 101, email: "student101@test.com", groupid: 1, role: "student" });

      const { result, rerender } = renderHook(
        ({ submissions }) => useAssignmentEmails(submissions),
        { initialProps: { submissions } }
      );

      await waitFor(() => {
        expect(result.current.studentEmails[101]).toBe("student101@test.com");
      });

      jest.clearAllMocks();

      rerender({ submissions });

      expect(mockGetUserById).not.toHaveBeenCalled();
    });

    it("debería manejar submissions con el mismo userid sin llamadas duplicadas", async () => {
      const submissions = [
        createSubmission(1, 101),
        createSubmission(2, 101),
      ];

      mockGetUserById.mockResolvedValue({ id: 101, email: "student101@test.com", groupid: 1, role: "student" });

      const { result } = renderHook(() => useAssignmentEmails(submissions));

      await waitFor(() => {
        expect(result.current.studentEmails[101]).toBe("student101@test.com");
      });

      expect(mockGetUserById).toHaveBeenCalledTimes(1);
    });

    it("debería ignorar submissions vacías sin llamar a getUserById", async () => {
      const { result } = renderHook(() => useAssignmentEmails([]));

      await waitFor(() => {
        expect(result.current.studentEmails).toEqual({});
      });

      expect(mockGetUserById).not.toHaveBeenCalled();
    });
  });

  describe("error path", () => {
    it("debería manejar error en getUserById sin romper el hook", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const submissions = [createSubmission(1, 101)];

      mockGetUserById.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAssignmentEmails(submissions));

      await waitFor(() => {
        expect(result.current.studentEmails).toEqual({});
      });

      expect(mockGetUserById).toHaveBeenCalledWith(101);
      consoleSpy.mockRestore();
    });

    it("debería manejar error mixto: uno falla, otro funciona", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const submissions = [
        createSubmission(1, 101),
        createSubmission(2, 102),
      ];

      mockGetUserById.mockImplementation((id: number) => {
        if (id === 101) return Promise.reject(new Error("Fail"));
        if (id === 102) return Promise.resolve({ id: 102, email: "student102@test.com", groupid: 1, role: "student" });
        return Promise.reject(new Error("Not found"));
      });

      const { result } = renderHook(() => useAssignmentEmails(submissions));

      await waitFor(() => {
        expect(result.current.studentEmails[102]).toBe("student102@test.com");
      });

      expect(result.current.studentEmails[101]).toBeUndefined();
      consoleSpy.mockRestore();
    });
  });
});
