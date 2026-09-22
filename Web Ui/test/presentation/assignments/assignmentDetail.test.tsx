import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import "@testing-library/jest-dom";
import AssignmentDetail from "../../../src/presentation/assignments/pages/AssignmentDetail";
import { GitLinkDialog } from "../../../src/shared/components/GitHubLinkDialog";

jest.setTimeout(10000);

const mockGetStudentSubmission = jest.fn();
const mockGetFeatureFlagByName = jest.fn();
const mockGetTeacherSubmissions = jest.fn();

jest.mock(
  "../../../src/modules/Assignments/application/GetAssignmentDetail",
  () => ({
    GetAssignmentDetail: jest.fn().mockImplementation(() => ({
      obtainAssignmentDetail: jest.fn().mockResolvedValue({
        title: "Test Assignment",
        description: "Test description",
        start_date: new Date(),
        end_date: new Date(),
        state: "pending",
        link: "https://github.com/test/test-repo",
        comment: "Test comment",
        groupid: 123,
      }),
    })),
  })
);

jest.mock("../../../src/modules/Groups/application/GetGroupDetail", () => ({
  GetGroupDetail: jest.fn().mockImplementation(() => ({
    obtainGroupDetail: jest.fn().mockResolvedValue({ groupName: "Test Group" }),
  })),
}));

jest.mock(
  "../../../src/modules/Submissions/Aplication/getSubmissionByUseridandSubmissionid",
  () => ({
    GetSubmissionByUserandAssignmentId: jest.fn().mockImplementation(() => ({
      getSubmisssionByUserandSubmissionId: mockGetStudentSubmission,
    })),
  })
);

jest.mock(
  "../../../src/modules/FeatureFlags/application/GetFeatureFlagByName",
  () => ({
    GetFeatureFlagByName: jest.fn().mockImplementation(() => ({
      execute: mockGetFeatureFlagByName,
    })),
  })
);

jest.mock("../../../src/modules/Users/repository/UsersRepository", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getUserById: jest.fn().mockImplementation((userid: number) =>
      Promise.resolve({
        email:
          userid === 123
            ? "student1@example.com"
            : userid === 124
              ? "student2@example.com"
              : "unknown@example.com",
      })
    ),
  })),
}));

jest.mock(
  "../../../src/modules/Submissions/Aplication/getSubmissionsByAssignmentId",
  () => ({
    GetSubmissionsByAssignmentId: jest.fn().mockImplementation(() => ({
      getSubmissionsByAssignmentId: mockGetTeacherSubmissions,
    })),
  })
);

function renderAssignmentDetail(role: "student" | "teacher", userid = 123) {
  return render(
    <MemoryRouter initialEntries={["/assignment/1"]}>
      <Routes>
        <Route
          path="/assignment/:id"
          element={<AssignmentDetail role={role} userid={userid} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("AssignmentDetail Component", () => {
  beforeEach(() => {
    mockGetStudentSubmission.mockReset();
    mockGetStudentSubmission.mockRejectedValue(new Error("Submission not found"));
    mockGetFeatureFlagByName.mockReset();
    mockGetFeatureFlagByName.mockResolvedValue(null);
    mockGetTeacherSubmissions.mockReset();
    mockGetTeacherSubmissions.mockResolvedValue([
      {
        id: 1,
        assignmentid: 1,
        userid: 123,
        status: "delivered",
        repository_link: "https://github.com/student/repo1",
        start_date: new Date("2026-09-01T12:00:00Z"),
        end_date: new Date("2026-09-02T12:00:00Z"),
        comment: "Good job",
      },
      {
        id: 2,
        assignmentid: 1,
        userid: 124,
        status: "in progress",
        repository_link: "https://github.com/student/repo2",
        start_date: new Date("2026-09-01T12:00:00Z"),
        end_date: null,
        comment: null,
      },
    ]);
  });

  it("displays the group name", async () => {
    const { getByText } = renderAssignmentDetail("student");

    await waitFor(() => {
      const groupName = getByText("Test Group");
      expect(groupName).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it("displays the Estado and Enlace sections for student role", async () => {
    const { getByText } = renderAssignmentDetail("student");

    await waitFor(() => {
      const estado = getByText("Estado:");
      expect(estado).toBeInTheDocument();
    });

    await waitFor(() => {
      const enlace = getByText("Enlace:");
      expect(enlace).toBeInTheDocument();
    });
  });

  it("does not display the Estado and Enlace sections for teacher roles", async () => {
    const { queryByText } = renderAssignmentDetail("teacher");

    await waitFor(() => {
      const estado = queryByText("Estado:");
      expect(estado).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const enlace = queryByText("Enlace:");
      expect(enlace).not.toBeInTheDocument();
    });
  });

  it("muestra solo 'Iniciar tarea' para una tarea pendiente", async () => {
    renderAssignmentDetail("student");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Iniciar tarea" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Ver gr/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Finalizar tarea" })).not.toBeInTheDocument();
    });
  });

  it("muestra 'Finalizar tarea' y 'Ver gráfica' para una tarea en progreso", async () => {
    mockGetStudentSubmission.mockResolvedValue({
      id: 1,
      assignmentid: 1,
      userid: 123,
      status: "in progress",
      repository_link: "https://github.com/student/practice",
      start_date: new Date("2026-09-01T12:00:00Z"),
      end_date: null,
      comment: null,
    });

    renderAssignmentDetail("student");

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Iniciar tarea" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Ver gr/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Finalizar tarea" })).toBeInTheDocument();
      expect(
        screen.getByRole("status", { name: "Estado de la tarea: En progreso" })
      ).toHaveClass("assignment-status-chip", "is-progress");
    });
  });

  it("muestra solo 'Ver gráfica' para una tarea enviada", async () => {
    mockGetStudentSubmission.mockResolvedValue({
      id: 1,
      assignmentid: 1,
      userid: 123,
      status: "delivered",
      repository_link: "https://github.com/student/practice",
      start_date: new Date("2026-09-01T12:00:00Z"),
      end_date: new Date("2026-09-02T12:00:00Z"),
      comment: "Entrega finalizada",
    });

    renderAssignmentDetail("student");

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Iniciar tarea" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Ver gr/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Finalizar tarea" })).not.toBeInTheDocument();
    });
  });

  it("does not display 'Iniciar tarea', 'Ver gráfica', or 'Finalizar tarea' buttons for non-student roles", async () => {
    const { queryByText } = renderAssignmentDetail("teacher");

    await waitFor(() => {
      const iniciarTareaButton = queryByText("Iniciar tarea");
      const verGraficaButton = queryByText("Ver gráfica");
      const finalizarTareaButton = queryByText("Finalizar tarea");

      expect(iniciarTareaButton).not.toBeInTheDocument();
      expect(verGraficaButton).not.toBeInTheDocument();
      expect(finalizarTareaButton).not.toBeInTheDocument();
    });
  });

  it("displays the list of submissions for teacher role", async () => {
    renderAssignmentDetail("teacher");

    await waitFor(
      () => {
        expect(screen.getByText("Lista de entregas")).toBeInTheDocument();
        expect(screen.getByText("Enviado")).toBeInTheDocument();
        expect(screen.getByText("En progreso")).toBeInTheDocument();
        expect(screen.getByText("student1@example.com")).toBeInTheDocument();
        expect(screen.getByText("student2@example.com")).toBeInTheDocument();
        expect(
          screen.getByLabelText("Abrir repositorio de student1@example.com")
        ).toBeInTheDocument();
        expect(
          screen.getByLabelText("Abrir repositorio de student2@example.com")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("shows loading indicator while fetching assignment details", async () => {
    const { getByTestId } = renderAssignmentDetail("student");

    const loadingIndicator = getByTestId("loading-indicator");
    expect(loadingIndicator).toBeInTheDocument();
  });

  it("opens and closes the GitLinkDialog", async () => {
    const handleClose = jest.fn();
    const handleSend = jest.fn();

    const { getByText, getByRole } = render(
      <GitLinkDialog open={true} onClose={handleClose} onSend={handleSend} />
    );

    await waitFor(() => {
      expect(getByText(/Enviar/i)).toBeInTheDocument();
    });

    const closeButton = getByRole("button", { name: /Cerrar/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    const sendButton = getByRole("button", { name: /Enviar/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(handleSend).not.toHaveBeenCalled();
    });

    const input = getByRole("textbox", { name: /Enlace de Github/i });
    fireEvent.change(input, {
      target: { value: "https://github.com/test/repo" },
    });

    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(handleSend).toHaveBeenCalledTimes(1);
      expect(handleSend).toHaveBeenCalledWith("https://github.com/test/repo");
    });
  });
});
