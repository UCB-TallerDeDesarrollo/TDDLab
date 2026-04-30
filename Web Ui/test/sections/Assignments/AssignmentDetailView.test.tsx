import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AssignmentDetailView } from "../../../src/sections/Assignments/AssignmentDetailView";
import type { AssignmentDataObject } from "../../../src/modules/Assignments/domain/assignmentInterfaces";
import type { SubmissionDataObject } from "../../../src/modules/Submissions/Domain/submissionInterfaces";

jest.mock("../../../src/sections/Assignments/components/GitHubLinkDialog", () => ({
  GitLinkDialog: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="git-link-dialog"><button onClick={onClose}>Close Dialog</button></div> : null,
}));

jest.mock("../../../src/sections/Assignments/components/CommentDialog", () => ({
  CommentDialog: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="comment-dialog"><button onClick={onClose}>Close Dialog</button></div> : null,
}));

jest.mock("../../../src/sections/Assignments/components/SubmissionTable", () => ({
  SubmissionTable: ({ submissions }: { submissions: SubmissionDataObject[] }) => (
    <div data-testid="submission-table">
      {submissions.map((s) => (
        <div key={s.id} data-testid={`submission-${s.id}`}>
          submission-{s.userid}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("../../../src/utils/dateUtils", () => ({
  formatDate: (date: string) => `formatted-${date}`,
}));

jest.mock("../../../src/utils/submissionStatus", () => ({
  getSubmissionStatusLabel: (status?: string) => (status ? `Status: ${status}` : "Pendiente"),
}));

const mockAssignment: AssignmentDataObject = {
  id: 1,
  title: "Tarea de prueba",
  description: "Descripción de la tarea",
  start_date: new Date("2024-01-01"),
  end_date: new Date("2024-01-15"),
  state: "pending",
  link: "https://github.com/test/repo",
  comment: "Comentario del profesor",
  groupid: 1,
};

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

const defaultProps = {
  role: "student",
  assignment: mockAssignment,
  groupName: "Grupo Test",
  studentSubmission: undefined as SubmissionDataObject | undefined,
  submissionRepositoryLink: "https://github.com/test/repo",
  linkDialogOpen: false,
  isCommentDialogOpen: false,
  showIAButton: false,
  isTaskInProgress: false,
  loadingSubmissions: false,
  submissions: [] as SubmissionDataObject[],
  studentEmails: {} as Record<number, string>,
  disableAdditionalGraphs: false,
  onOpenLinkDialog: jest.fn(),
  onCloseLinkDialog: jest.fn(),
  onSendGithubLink: jest.fn(),
  onOpenCommentDialog: jest.fn(),
  onCloseCommentDialog: jest.fn(),
  onSendComment: jest.fn(),
  onViewStudentGraph: jest.fn(),
  onOpenStudentAssistant: jest.fn(),
  onViewGraph: jest.fn(),
  onOpenAssistant: jest.fn(),
  onViewAdditionalGraph: jest.fn(),
};

const renderView = (props = {}) => {
  const merged = { ...defaultProps, ...props };
  return render(<AssignmentDetailView {...merged} />);
};

describe("AssignmentDetailView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loading state", () => {
    it("debería mostrar el indicador de carga cuando assignment es null", () => {
      renderView({ assignment: null });

      expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
      expect(screen.queryByText("Tarea de prueba")).not.toBeInTheDocument();
    });

    it("debería mostrar la vista de admin aun con assignment null para teacher", () => {
      renderView({ assignment: null, role: "teacher" });

      expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
      expect(screen.getByText("Lista de entregas")).toBeInTheDocument();
    });
  });

  describe("student view (role = student)", () => {
    it("debería mostrar el título de la tarea", () => {
      renderView({ role: "student" });

      expect(screen.getByText("Tarea de prueba")).toBeInTheDocument();
    });

    it("debería mostrar el nombre del grupo", () => {
      renderView({ role: "student" });

      expect(screen.getByText("Grupo Test")).toBeInTheDocument();
    });

    it("debería mostrar las instrucciones (description) solo para estudiantes", () => {
      renderView({ role: "student" });

      expect(screen.getByText("Descripción de la tarea")).toBeInTheDocument();
    });

    it("debería mostrar las fechas formateadas de inicio y finalización", () => {
      renderView({ role: "student" });

      expect(screen.getByText(/Inicio:/)).toBeInTheDocument();
      expect(screen.getByText(/Finalización:/)).toBeInTheDocument();
    });

    it("debería mostrar el estado de la submission cuando existe studentSubmission", () => {
      renderView({ role: "student", studentSubmission: mockSubmission });

      expect(screen.getByText("Status: in progress")).toBeInTheDocument();
    });

    it("debería mostrar 'Pendiente' como estado cuando no hay studentSubmission", () => {
      renderView({ role: "student", studentSubmission: undefined });

      expect(screen.getByText("Pendiente")).toBeInTheDocument();
    });

    it("debería mostrar el enlace del repositorio cuando existe studentSubmission", () => {
      renderView({ role: "student", studentSubmission: mockSubmission });

      expect(screen.getByText(/Enlace:/)).toBeInTheDocument();
      const link = screen.getByRole("link", { name: /https:\/\/github\.com\/student\/repo/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://github.com/student/repo");
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("debería mostrar el comentario del profesor cuando existe en el assignment", () => {
      renderView({ role: "student" });

      expect(screen.getByText("Comentario del profesor")).toBeInTheDocument();
    });

    it("NO debería mostrar la sección de Comentario cuando el assignment no tiene comment", () => {
      const assignmentWithoutComment = { ...mockAssignment, comment: "" };
      renderView({ role: "student", assignment: assignmentWithoutComment });

      expect(screen.queryByText(/Comentario:/)).not.toBeInTheDocument();
    });

    it("debería mostrar los botones de acción para estudiantes", () => {
      renderView({ role: "student" });

      expect(screen.getByRole("button", { name: "Iniciar tarea" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Ver gráfica" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Finalizar tarea" })).toBeInTheDocument();
    });
  });

  describe("teacher view (role = teacher)", () => {
    it("NO debería mostrar instrucciones para teachers", () => {
      renderView({ role: "teacher" });

      expect(screen.queryByText("Instrucciones: Descripción de la tarea")).not.toBeInTheDocument();
    });

    it("NO debería mostrar estado, enlace ni comentario para teachers", () => {
      renderView({ role: "teacher", studentSubmission: mockSubmission });

      expect(screen.queryByText(/Estado:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Enlace:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Comentario:/)).not.toBeInTheDocument();
    });

    it("NO debería mostrar botones de acción para teachers", () => {
      renderView({ role: "teacher" });

      expect(screen.queryByRole("button", { name: "Iniciar tarea" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Ver gráfica" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Finalizar tarea" })).not.toBeInTheDocument();
    });

    it("debería mostrar 'Lista de entregas' para teachers", () => {
      renderView({ role: "teacher" });

      expect(screen.getByText("Lista de entregas")).toBeInTheDocument();
    });

    it("debería mostrar SubmissionTable cuando no está cargando", () => {
      const submissions: SubmissionDataObject[] = [mockSubmission];
      renderView({ role: "teacher", submissions, studentEmails: { 123: "student@test.com" } });

      expect(screen.getByTestId("submission-table")).toBeInTheDocument();
      expect(screen.getByTestId("submission-1")).toBeInTheDocument();
    });

    it("debería mostrar indicador de carga en la tabla cuando loadingSubmissions es true", () => {
      renderView({ role: "teacher", loadingSubmissions: true });

      expect(screen.queryByTestId("submission-table")).not.toBeInTheDocument();
      const progressBars = screen.getAllByRole("progressbar");
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe("estados disabled en botones", () => {
    it("debería deshabilitar 'Iniciar tarea' cuando ya existe studentSubmission", () => {
      renderView({ role: "student", studentSubmission: mockSubmission });

      const btn = screen.getByRole("button", { name: "Iniciar tarea" });
      expect(btn).toBeDisabled();
    });

    it("debería habilitar 'Iniciar tarea' cuando NO existe studentSubmission", () => {
      renderView({ role: "student", studentSubmission: undefined });

      const btn = screen.getByRole("button", { name: "Iniciar tarea" });
      expect(btn).not.toBeDisabled();
    });

    it("debería deshabilitar 'Ver gráfica' cuando studentSubmission es undefined", () => {
      renderView({ role: "student", studentSubmission: undefined });

      const btn = screen.getByRole("button", { name: "Ver gráfica" });
      expect(btn).toBeDisabled();
    });

    it("debería deshabilitar 'Ver gráfica' cuando repository_link está vacío", () => {
      const emptyLinkSubmission = { ...mockSubmission, repository_link: "" };
      renderView({ role: "student", studentSubmission: emptyLinkSubmission });

      const btn = screen.getByRole("button", { name: "Ver gráfica" });
      expect(btn).toBeDisabled();
    });

    it("debería habilitar 'Ver gráfica' cuando hay repository_link válido", () => {
      renderView({ role: "student", studentSubmission: mockSubmission });

      const btn = screen.getByRole("button", { name: "Ver gráfica" });
      expect(btn).not.toBeDisabled();
    });

    it("debería deshabilitar 'Finalizar tarea' cuando isTaskInProgress es true", () => {
      renderView({ role: "student", isTaskInProgress: true });

      const btn = screen.getByRole("button", { name: "Finalizar tarea" });
      expect(btn).toBeDisabled();
    });

    it("debería habilitar 'Finalizar tarea' cuando isTaskInProgress es false", () => {
      renderView({ role: "student", isTaskInProgress: false });

      const btn = screen.getByRole("button", { name: "Finalizar tarea" });
      expect(btn).not.toBeDisabled();
    });
  });

  describe("IA button", () => {
    it("NO debería mostrar 'Asistente IA' cuando showIAButton es false", () => {
      renderView({ role: "student", showIAButton: false });

      expect(screen.queryByRole("button", { name: "Asistente IA" })).not.toBeInTheDocument();
    });

    it("debería mostrar 'Asistente IA' cuando showIAButton es true", () => {
      renderView({ role: "student", showIAButton: true, studentSubmission: mockSubmission });

      expect(screen.getByRole("button", { name: "Asistente IA" })).toBeInTheDocument();
    });

    it("debería deshabilitar 'Asistente IA' cuando studentSubmission es undefined", () => {
      renderView({ role: "student", showIAButton: true, studentSubmission: undefined });

      const btn = screen.getByRole("button", { name: "Asistente IA" });
      expect(btn).toBeDisabled();
    });

    it("debería deshabilitar 'Asistente IA' cuando repository_link está vacío", () => {
      const emptyLink = { ...mockSubmission, repository_link: "" };
      renderView({ role: "student", showIAButton: true, studentSubmission: emptyLink });

      const btn = screen.getByRole("button", { name: "Asistente IA" });
      expect(btn).toBeDisabled();
    });

    it("debería habilitar 'Asistente IA' cuando hay repository_link válido", () => {
      renderView({ role: "student", showIAButton: true, studentSubmission: mockSubmission });

      const btn = screen.getByRole("button", { name: "Asistente IA" });
      expect(btn).not.toBeDisabled();
    });

    it("NO debería mostrar 'Asistente IA' para teachers aunque showIAButton sea true", () => {
      renderView({ role: "teacher", showIAButton: true });

      expect(screen.queryByRole("button", { name: "Asistente IA" })).not.toBeInTheDocument();
    });
  });

  describe("dialogs render", () => {
    it("debería renderizar GitLinkDialog cuando linkDialogOpen es true", () => {
      renderView({ role: "student", linkDialogOpen: true });

      expect(screen.getByTestId("git-link-dialog")).toBeInTheDocument();
    });

    it("NO debería renderizar GitLinkDialog cuando linkDialogOpen es false", () => {
      renderView({ role: "student", linkDialogOpen: false });

      expect(screen.queryByTestId("git-link-dialog")).not.toBeInTheDocument();
    });

    it("debería renderizar CommentDialog cuando isCommentDialogOpen es true", () => {
      renderView({ role: "student", isCommentDialogOpen: true });

      expect(screen.getByTestId("comment-dialog")).toBeInTheDocument();
    });

    it("NO debería renderizar CommentDialog cuando isCommentDialogOpen es false", () => {
      renderView({ role: "student", isCommentDialogOpen: false });

      expect(screen.queryByTestId("comment-dialog")).not.toBeInTheDocument();
    });

    it("debería llamar a onCloseLinkDialog cuando se cierra GitLinkDialog", () => {
      const onCloseLinkDialog = jest.fn();
      renderView({ role: "student", linkDialogOpen: true, onCloseLinkDialog });

      fireEvent.click(screen.getByText("Close Dialog"));
      expect(onCloseLinkDialog).toHaveBeenCalledTimes(1);
    });

    it("debería llamar a onCloseCommentDialog cuando se cierra CommentDialog", () => {
      const onCloseCommentDialog = jest.fn();
      renderView({ role: "student", isCommentDialogOpen: true, onCloseCommentDialog });

      fireEvent.click(screen.getByText("Close Dialog"));
      expect(onCloseCommentDialog).toHaveBeenCalledTimes(1);
    });
  });

  describe("callbacks", () => {
    it("debería llamar a onOpenLinkDialog al hacer clic en 'Iniciar tarea'", () => {
      const onOpenLinkDialog = jest.fn();
      renderView({ role: "student", onOpenLinkDialog });

      fireEvent.click(screen.getByRole("button", { name: "Iniciar tarea" }));
      expect(onOpenLinkDialog).toHaveBeenCalledTimes(1);
    });

    it("debería llamar a onViewStudentGraph al hacer clic en 'Ver gráfica'", () => {
      const onViewStudentGraph = jest.fn();
      renderView({ role: "student", studentSubmission: mockSubmission, onViewStudentGraph });

      fireEvent.click(screen.getByRole("button", { name: "Ver gráfica" }));
      expect(onViewStudentGraph).toHaveBeenCalledTimes(1);
    });

    it("debería llamar a onOpenCommentDialog al hacer clic en 'Finalizar tarea'", () => {
      const onOpenCommentDialog = jest.fn();
      renderView({ role: "student", onOpenCommentDialog });

      fireEvent.click(screen.getByRole("button", { name: "Finalizar tarea" }));
      expect(onOpenCommentDialog).toHaveBeenCalledTimes(1);
    });

    it("debería llamar a onOpenStudentAssistant al hacer clic en 'Asistente IA'", () => {
      const onOpenStudentAssistant = jest.fn();
      renderView({ role: "student", showIAButton: true, studentSubmission: mockSubmission, onOpenStudentAssistant });

      fireEvent.click(screen.getByRole("button", { name: "Asistente IA" }));
      expect(onOpenStudentAssistant).toHaveBeenCalledTimes(1);
    });
  });
});
