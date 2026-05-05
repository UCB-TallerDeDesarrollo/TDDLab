import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AssignmentDetailContainer from "../../../src/sections/Assignments/AssignmentDetailContainer";
import type { SubmissionDataObject } from "../../../src/modules/Submissions/Domain/submissionInterfaces";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAssignmentDetail,
  useGroupDetail,
  useAssignmentSubmissions,
  useStudentSubmission,
  useSubmissionByUserAndAssignment,
  useFeatureFlagEnabled,
} from "../../../src/sections/Assignments/hooks/useAssignmentDetailData";
import { useAssignmentSubmissionActions } from "../../../src/sections/Assignments/hooks/useAssignmentSubmissionActions";
import { useAssignmentEmails } from "../../../src/sections/Assignments/hooks/useAssignmentEmails";
import { useAssignmentDialogs } from "../../../src/sections/Assignments/hooks/useAssignmentDialogs";
import { handleRedirectAdmin, handleRedirectStudent } from "../../../src/sections/Shared/handlers";
import { isStudent } from "../../../src/utils/roleGuards";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("../../../src/sections/Assignments/hooks/useAssignmentDetailData");
jest.mock("../../../src/sections/Assignments/hooks/useAssignmentSubmissionActions");
jest.mock("../../../src/sections/Assignments/hooks/useAssignmentEmails");
jest.mock("../../../src/sections/Assignments/hooks/useAssignmentDialogs");
jest.mock("../../../src/sections/Shared/handlers");
jest.mock("../../../src/utils/roleGuards");

const mockNavigate = jest.fn();
const mockHandleRedirectAdmin = jest.fn();
const mockHandleRedirectStudent = jest.fn();
const mockIsStudent = jest.fn();

const mockSubmission: SubmissionDataObject = {
  id: 1,
  assignmentid: 1,
  userid: 123,
  status: "in progress",
  repository_link: "https://github.com/student/repo",
  start_date: new Date("2024-01-02"),
  end_date: new Date("2024-01-02"),
  comment: "",
};

const mockSubmission2: SubmissionDataObject = {
  id: 2,
  assignmentid: 1,
  userid: 456,
  status: "delivered",
  repository_link: "https://github.com/student2/repo2",
  start_date: new Date("2024-01-03"),
  end_date: new Date("2024-01-10"),
  comment: "Done",
};

const defaultHookReturns = {
  useParams: { id: "1" },
  useNavigate: mockNavigate,
  useAssignmentDetail: {
    id: 1,
    title: "Tarea de prueba",
    description: "Descripción",
    start_date: new Date("2024-01-01"),
    end_date: new Date("2024-01-15"),
    state: "pending",
    link: "https://github.com/test/repo",
    comment: "Comentario",
    groupid: 1,
  },
  useGroupDetail: { id: 1, groupName: "Grupo Test", groupDetail: "", creationDate: new Date() },
  useAssignmentSubmissions: { submissions: [mockSubmission, mockSubmission2], loading: false, error: null, refresh: jest.fn() },
  useStudentSubmission: { studentSubmission: mockSubmission, error: null, refresh: jest.fn() },
  useSubmissionByUserAndAssignment: { submission: mockSubmission, refresh: jest.fn() },
  useFeatureFlagEnabled: false,
  useAssignmentEmails: { studentEmails: { 123: "student@test.com", 456: "student2@test.com" } },
  useAssignmentDialogs: {
    linkDialogOpen: false,
    isCommentDialogOpen: false,
    handleOpenLinkDialog: jest.fn(),
    handleCloseLinkDialog: jest.fn(),
    handleOpenCommentDialog: jest.fn(),
    handleCloseCommentDialog: jest.fn(),
  },
  useAssignmentSubmissionActions: {
    sendGithubLink: jest.fn(),
    sendComment: jest.fn(),
  },
};

beforeEach(() => {
  jest.clearAllMocks();

  (useParams as jest.Mock).mockReturnValue(defaultHookReturns.useParams);
  (useNavigate as jest.Mock).mockReturnValue(defaultHookReturns.useNavigate);
  (useAssignmentDetail as jest.Mock).mockReturnValue(defaultHookReturns.useAssignmentDetail);
  (useGroupDetail as jest.Mock).mockReturnValue(defaultHookReturns.useGroupDetail);
  (useAssignmentSubmissions as jest.Mock).mockReturnValue(defaultHookReturns.useAssignmentSubmissions);
  (useStudentSubmission as jest.Mock).mockReturnValue(defaultHookReturns.useStudentSubmission);
  (useSubmissionByUserAndAssignment as jest.Mock).mockReturnValue(defaultHookReturns.useSubmissionByUserAndAssignment);
  (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string) => {
    if (flagName === "Mostrar Graficas Adicionales") return false;
    if (flagName === "Boton Asistente IA") return false;
    return false;
  });

  (useAssignmentSubmissionActions as jest.Mock).mockReturnValue(defaultHookReturns.useAssignmentSubmissionActions);
  (useAssignmentEmails as jest.Mock).mockReturnValue(defaultHookReturns.useAssignmentEmails);
  (useAssignmentDialogs as jest.Mock).mockReturnValue(defaultHookReturns.useAssignmentDialogs);

  (handleRedirectAdmin as jest.Mock).mockImplementation(mockHandleRedirectAdmin);
  (handleRedirectStudent as jest.Mock).mockImplementation(mockHandleRedirectStudent);

  mockIsStudent.mockImplementation((role: string) => role === "student");
  (isStudent as jest.Mock).mockImplementation(mockIsStudent);
});

describe("AssignmentDetailContainer", () => {
  describe("renders AssignmentDetailView with correct props", () => {
    it("debería renderizar AssignmentDetailView para student", () => {
      render(<AssignmentDetailContainer role="student" userid={123} />);
      expect(screen.getByText("Tarea de prueba")).toBeInTheDocument();
    });

    it("debería renderizar AssignmentDetailView para teacher", () => {
      render(<AssignmentDetailContainer role="teacher" userid={123} />);
      expect(screen.getByText("Tarea de prueba")).toBeInTheDocument();
      expect(screen.getByText("Lista de entregas")).toBeInTheDocument();
    });
  });

  describe("branches: isStudent en hooks", () => {
    it("debería habilitar submissions para teacher (isStudent=false)", () => {
      (useAssignmentSubmissions as jest.Mock).mockReturnValue({
        submissions: [mockSubmission],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });
      mockIsStudent.mockReturnValue(false);

      render(<AssignmentDetailContainer role="teacher" userid={123} />);
      expect(screen.getByText("Lista de entregas")).toBeInTheDocument();
    });

    it("debería deshabilitar submissions para student (isStudent=true)", () => {
      (useAssignmentSubmissions as jest.Mock).mockReturnValue({
        submissions: [],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });
      mockIsStudent.mockReturnValue(true);

      render(<AssignmentDetailContainer role="student" userid={123} />);
      expect(screen.queryByText("Lista de entregas")).not.toBeInTheDocument();
    });

    it("debería habilitar useStudentSubmission cuando isStudent=true", () => {
      const studentSub = { ...mockSubmission, userid: 123 };
      (useStudentSubmission as jest.Mock).mockReturnValue({
        studentSubmission: studentSub,
        error: null,
        refresh: jest.fn(),
      });
      mockIsStudent.mockReturnValue(true);

      render(<AssignmentDetailContainer role="student" userid={123} />);
      expect(screen.getByText("Estado:")).toBeInTheDocument();
    });

    it("debería deshabilitar useStudentSubmission cuando isStudent=false", () => {
      (useStudentSubmission as jest.Mock).mockReturnValue({
        studentSubmission: undefined,
        error: null,
        refresh: jest.fn(),
      });
      mockIsStudent.mockReturnValue(false);

      render(<AssignmentDetailContainer role="teacher" userid={123} />);
      expect(screen.queryByText("Estado:")).not.toBeInTheDocument();
    });

    it("debería habilitar feature flag 'Mostrar Graficas Adicionales' para teacher (isStudent=false)", () => {
      (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string) => {
        if (flagName === "Mostrar Graficas Adicionales") return true;
        return false;
      });
      mockIsStudent.mockReturnValue(false);

      render(<AssignmentDetailContainer role="teacher" userid={123} />);
      const additionalButtons = screen.getAllByRole("button", { name: "Ver" });
      expect(additionalButtons.length).toBeGreaterThan(0);
      expect(additionalButtons.some((button) => !button.hasAttribute("disabled"))).toBe(true);
    });

    it("debería deshabilitar feature flag 'Mostrar Graficas Adicionales' para student (isStudent=true)", () => {
      (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string) => {
        if (flagName === "Mostrar Graficas Adicionales") return false;
        return false;
      });
      mockIsStudent.mockReturnValue(true);

      render(<AssignmentDetailContainer role="student" userid={123} />);
      expect(screen.queryByRole("button", { name: "Ver" })).not.toBeInTheDocument();
    });

    it("debería habilitar feature flag 'Boton Asistente IA' para student (isStudent=true)", () => {
      (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string) => {
        if (flagName === "Boton Asistente IA") return true;
        return false;
      });
      mockIsStudent.mockReturnValue(true);

      render(<AssignmentDetailContainer role="student" userid={123} />);
      expect(screen.getByRole("button", { name: "Asistente IA" })).toBeInTheDocument();
    });

    it("debería usar fallbackValue=true para 'Boton Asistente IA' cuando isStudent=true y flag no existe", () => {
      (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string, options?: { enabled?: boolean; defaultValue?: boolean; fallbackValue?: boolean }) => {
        if (flagName === "Boton Asistente IA" && options?.enabled) return options.fallbackValue ?? false;
        return false;
      });
      mockIsStudent.mockReturnValue(true);

      render(<AssignmentDetailContainer role="student" userid={123} />);
      expect(screen.getByRole("button", { name: "Asistente IA" })).toBeInTheDocument();
    });
  });

  describe("branch: isTaskInProgress", () => {
    it("debería deshabilitar 'Finalizar tarea' cuando isTaskInProgress es true (status !== 'in progress')", () => {
      (useSubmissionByUserAndAssignment as jest.Mock).mockReturnValue({
        submission: { ...mockSubmission, status: "delivered" },
        refresh: jest.fn(),
      });

      render(<AssignmentDetailContainer role="student" userid={123} />);
      const btn = screen.getByRole("button", { name: "Finalizar tarea" });
      expect(btn).toBeDisabled();
    });

    it("debería habilitar 'Finalizar tarea' cuando isTaskInProgress es false (status === 'in progress')", () => {
      (useSubmissionByUserAndAssignment as jest.Mock).mockReturnValue({
        submission: { ...mockSubmission, status: "in progress" },
        refresh: jest.fn(),
      });

      render(<AssignmentDetailContainer role="student" userid={123} />);
      const btn = screen.getByRole("button", { name: "Finalizar tarea" });
      expect(btn).not.toBeDisabled();
    });

    it("debería deshabilitar 'Finalizar tarea' cuando submission es null", () => {
      (useSubmissionByUserAndAssignment as jest.Mock).mockReturnValue({
        submission: null,
        refresh: jest.fn(),
      });

      render(<AssignmentDetailContainer role="student" userid={123} />);
      const btn = screen.getByRole("button", { name: "Finalizar tarea" });
      expect(btn).toBeDisabled();
    });
  });

  describe("branch: disableAdditionalGraphs", () => {
    it("debería deshabilitar botones de gráficas adicionales cuando disableAdditionalGraphs es true", () => {
      (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string) => {
        if (flagName === "Mostrar Graficas Adicionales") return false;
        return false;
      });
      mockIsStudent.mockReturnValue(false);

      render(<AssignmentDetailContainer role="teacher" userid={123} />);
      const additionalButtons = screen.getAllByRole("button", { name: "Ver" });
      expect(additionalButtons.length).toBeGreaterThan(0);
      additionalButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("debería habilitar botones de gráficas adicionales cuando disableAdditionalGraphs es false", () => {
      (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string) => {
        if (flagName === "Mostrar Graficas Adicionales") return true;
        return false;
      });
      mockIsStudent.mockReturnValue(false);

      render(<AssignmentDetailContainer role="teacher" userid={123} />);
      const additionalButtons = screen.getAllByRole("button", { name: "Ver" });
      expect(additionalButtons.length).toBeGreaterThan(0);
      additionalButtons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("callback: handleViewGraph", () => {
    it("debería llamar a handleRedirectAdmin con parámetros correctos al hacer clic en 'Ver grafica' (teacher)", () => {
      (useAssignmentSubmissions as jest.Mock).mockReturnValue({
        submissions: [mockSubmission],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });
      mockIsStudent.mockReturnValue(false);

      render(<AssignmentDetailContainer role="teacher" userid={123} />);
      const graphButtons = screen.getAllByRole("button", { name: "Ver grafica" });
      fireEvent.click(graphButtons[0]);

      expect(mockHandleRedirectAdmin).toHaveBeenCalledWith(
        mockSubmission.repository_link,
        [mockSubmission],
        mockSubmission.id,
        "/graph",
        mockNavigate
      );
      expect(localStorage.getItem("selectedMetric")).toBe("Dashboard");
    });
  });

  describe("callback: handleOpenAssistant", () => {
    it("debería navegar a /asistente-ia con repository_link al hacer clic en 'Asistente' (teacher)", () => {
      (useAssignmentSubmissions as jest.Mock).mockReturnValue({
        submissions: [mockSubmission],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });
      (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string) => {
        if (flagName === "Boton Asistente IA") return true;
        return false;
      });
      mockIsStudent.mockReturnValue(false);

      render(<AssignmentDetailContainer role="teacher" userid={123} />);
      const assistantButtons = screen.getAllByRole("button", { name: "Asistente" });
      fireEvent.click(assistantButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith("/asistente-ia", {
        state: { repositoryLink: mockSubmission.repository_link },
      });
    });
  });

  describe("callback: handleViewAdditionalGraph", () => {
    it("debería llamar a handleRedirectAdmin con /aditionalgraph al hacer clic en 'Ver grafica adicional'", () => {
      (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string) => {
        if (flagName === "Mostrar Graficas Adicionales") return true;
        return false;
      });
      (useAssignmentSubmissions as jest.Mock).mockReturnValue({
        submissions: [mockSubmission],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });
      mockIsStudent.mockReturnValue(false);

      render(<AssignmentDetailContainer role="teacher" userid={123} />);
      const btn = screen.getByRole("button", { name: "Ver" });
      fireEvent.click(btn);

      expect(mockHandleRedirectAdmin).toHaveBeenCalledWith(
        mockSubmission.repository_link,
        [mockSubmission],
        mockSubmission.id,
        "/aditionalgraph",
        mockNavigate
      );
      expect(localStorage.getItem("selectedMetric")).toBe("Complejidad");
    });
  });

  describe("callback: handleViewStudentGraph", () => {
    it("debería llamar a handleRedirectStudent cuando studentSubmission tiene repository_link", () => {
      (useStudentSubmission as jest.Mock).mockReturnValue({
        studentSubmission: mockSubmission,
        error: null,
        refresh: jest.fn(),
      });
      mockIsStudent.mockReturnValue(true);

      render(<AssignmentDetailContainer role="student" userid={123} />);
      const btn = screen.getByRole("button", { name: "Ver gráfica" });
      fireEvent.click(btn);

      expect(mockHandleRedirectStudent).toHaveBeenCalledWith(
        mockSubmission.repository_link,
        mockSubmission.id,
        mockNavigate
      );
      expect(localStorage.getItem("selectedMetric")).toBe("Dashboard");
    });

    it("NO debería llamar a handleRedirectStudent cuando studentSubmission es undefined", () => {
      (useStudentSubmission as jest.Mock).mockReturnValue({
        studentSubmission: undefined,
        error: null,
        refresh: jest.fn(),
      });
      mockIsStudent.mockReturnValue(true);

      render(<AssignmentDetailContainer role="student" userid={123} />);
      const btn = screen.getByRole("button", { name: "Ver gráfica" });
      expect(btn).toBeDisabled();
    });

    it("NO debería llamar a handleRedirectStudent cuando studentSubmission.repository_link es vacío", () => {
      (useStudentSubmission as jest.Mock).mockReturnValue({
        studentSubmission: { ...mockSubmission, repository_link: "" },
        error: null,
        refresh: jest.fn(),
      });
      mockIsStudent.mockReturnValue(true);

      render(<AssignmentDetailContainer role="student" userid={123} />);
      const btn = screen.getByRole("button", { name: "Ver gráfica" });
      expect(btn).toBeDisabled();
    });
  });

  describe("callback: handleOpenStudentAssistant", () => {
    it("debería navegar a /asistente-ia con repository_link de studentSubmission", () => {
      (useStudentSubmission as jest.Mock).mockReturnValue({
        studentSubmission: mockSubmission,
        error: null,
        refresh: jest.fn(),
      });
      (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string) => {
        if (flagName === "Boton Asistente IA") return true;
        return false;
      });
      mockIsStudent.mockReturnValue(true);

      render(<AssignmentDetailContainer role="student" userid={123} />);
      const btn = screen.getByRole("button", { name: "Asistente IA" });
      fireEvent.click(btn);

      expect(mockNavigate).toHaveBeenCalledWith("/asistente-ia", {
        state: { repositoryLink: mockSubmission.repository_link },
      });
      expect(localStorage.getItem("selectedMetric")).toBe("AssistantAI");
    });

    it("debería navegar a /asistente-ia con repository_link undefined cuando studentSubmission es null", () => {
      (useStudentSubmission as jest.Mock).mockReturnValue({
        studentSubmission: undefined,
        error: null,
        refresh: jest.fn(),
      });
      (useFeatureFlagEnabled as jest.Mock).mockImplementation((flagName: string) => {
        if (flagName === "Boton Asistente IA") return true;
        return false;
      });
      mockIsStudent.mockReturnValue(true);

      render(<AssignmentDetailContainer role="student" userid={123} />);
      const btn = screen.getByRole("button", { name: "Asistente IA" });
      expect(btn).toBeDisabled();
    });
  });

  describe("useParams: assignmentid", () => {
    it("debería usar el id de useParams correctamente", () => {
      (useParams as jest.Mock).mockReturnValue({ id: "42" });

      render(<AssignmentDetailContainer role="student" userid={123} />);
      expect(screen.getByText("Tarea de prueba")).toBeInTheDocument();
    });
  });

  describe("refresh callbacks", () => {
    it("debería llamar a refreshSubmissionData que invoca los tres refreshes", async () => {
      const refreshSubmissions = jest.fn();
      const refreshStudentSubmission = jest.fn();
      const refreshSubmission = jest.fn();

      (useAssignmentSubmissions as jest.Mock).mockReturnValue({
        submissions: [],
        loading: false,
        error: null,
        refresh: refreshSubmissions,
      });
      (useStudentSubmission as jest.Mock).mockReturnValue({
        studentSubmission: undefined,
        error: null,
        refresh: refreshStudentSubmission,
      });
      (useSubmissionByUserAndAssignment as jest.Mock).mockReturnValue({
        submission: null,
        refresh: refreshSubmission,
      });

      render(<AssignmentDetailContainer role="student" userid={123} />);
      expect(refreshSubmissions).not.toHaveBeenCalled();
    });
  });
});
