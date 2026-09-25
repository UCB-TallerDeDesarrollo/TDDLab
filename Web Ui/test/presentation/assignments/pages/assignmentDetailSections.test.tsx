import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import AssignmentDetail from "../../../../src/presentation/assignments/pages/AssignmentDetail";
import { useAssignmentDetailData } from "../../../../src/presentation/assignments/hooks/useAssignmentDetailData";

jest.mock(
  "../../../../src/presentation/assignments/hooks/useAssignmentDetailData",
  () => ({
    useAssignmentDetailData: jest.fn(),
  }),
);

const mockedUseAssignmentDetailData = useAssignmentDetailData as jest.MockedFunction<
  typeof useAssignmentDetailData
>;

const assignment = {
  title: "Tarea de prueba",
  description: "d",
  start_date: new Date("2024-01-01"),
  end_date: new Date("2024-02-01"),
  state: "open",
  link: "https://github.com/test/repo",
  comment: "",
  groupid: 1,
};

const inProgressSubmission = {
  id: 2,
  assignmentid: 1,
  userid: 1,
  status: "in progress",
  repository_link: "https://github.com/u/repo",
  start_date: new Date(),
  end_date: new Date(),
  comment: "",
};

const deliveredSubmission = {
  id: 2,
  assignmentid: 1,
  userid: 1,
  status: "delivered",
  repository_link: "https://github.com/u/repo",
  start_date: new Date(),
  end_date: new Date(),
  comment: "ok",
};

function makeHookReturn(
  overrides: Partial<ReturnType<typeof useAssignmentDetailData>> = {}
) {
  return {
    assignment,
    assignmentState: "success" as const,
    groupDetails: { groupName: "Grupo A" },
    deliveriesState: "success" as const,
    deliveriesRows: [],
    studentSubmission: null,
    studentStatusLabel: "Pendiente",
    isTaskInProgress: true,
    isActionLoading: false,
    showIAButton: true,
    disableAdditionalGraphs: true,
    isStudent: true,
    submissionRepositoryLink: undefined,
    studentRepositoryLink: undefined,
    uiMessage: null,
    linkDialogOpen: false,
    isCommentDialogOpen: false,
    openLinkDialog: jest.fn(),
    closeLinkDialog: jest.fn(),
    sendGithubLink: jest.fn(),
    openCommentDialog: jest.fn(),
    closeCommentDialog: jest.fn(),
    sendComment: jest.fn(),
    redirectStudentToGraph: jest.fn(),
    redirectStudentToAssistant: jest.fn(),
    openTeacherGraph: jest.fn(),
    openTeacherAssistant: jest.fn(),
    openTeacherAdditionalGraphs: jest.fn(),
    closeUiMessage: jest.fn(),
    ...overrides,
  } as ReturnType<typeof useAssignmentDetailData>;
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <AssignmentDetail role="student" userid={1} />
    </MemoryRouter>
  );

describe("AssignmentDetail student primary action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows only Iniciar + Ver gráfica when the task is pending", () => {
    mockedUseAssignmentDetailData.mockReturnValue(makeHookReturn());

    renderPage();

    expect(
      screen.getByRole("button", { name: /iniciar tarea/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ver gráfica/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /finalizar tarea/i })
    ).not.toBeInTheDocument();
  });

  it("shows only Finalizar + Ver gráfica when the task is in progress", () => {
    mockedUseAssignmentDetailData.mockReturnValue(
      makeHookReturn({
        studentSubmission: inProgressSubmission,
        studentStatusLabel: "En progreso",
        isTaskInProgress: false,
      })
    );

    renderPage();

    expect(
      screen.getByRole("button", { name: /finalizar tarea/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ver gráfica/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /iniciar tarea/i })
    ).not.toBeInTheDocument();
  });

  it("shows neither Iniciar nor Finalizar for a delivered task but keeps Ver gráfica", () => {
    mockedUseAssignmentDetailData.mockReturnValue(
      makeHookReturn({
        studentSubmission: deliveredSubmission,
        studentStatusLabel: "Enviado",
      })
    );

    renderPage();

    expect(
      screen.queryByRole("button", { name: /iniciar tarea/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /finalizar tarea/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ver gráfica/i })
    ).toBeInTheDocument();
  });

  it("never renders both primary actions at the same time", () => {
    const submissions = [null, inProgressSubmission, deliveredSubmission];

    submissions.forEach((sub) => {
      jest.clearAllMocks();
      mockedUseAssignmentDetailData.mockReturnValue(
        makeHookReturn({
          studentSubmission: sub,
          studentStatusLabel: sub ? "Estado" : "Pendiente",
          isTaskInProgress: !sub,
        })
      );

      const { unmount } = renderPage();
      const startBtn = screen.queryByRole("button", { name: /iniciar tarea/i });
      const finishBtn = screen.queryByRole("button", {
        name: /finalizar tarea/i,
      });
      expect(Boolean(startBtn) && Boolean(finishBtn)).toBe(false);
      unmount();
    });
  });

  it("shows a loading spinner on the primary action while saving", () => {
    mockedUseAssignmentDetailData.mockReturnValue(
      makeHookReturn({
        studentSubmission: inProgressSubmission,
        studentStatusLabel: "En progreso",
        isTaskInProgress: false,
        isActionLoading: true,
      })
    );

    renderPage();

    expect(
      screen.getByRole("status", { name: /cargando/i })
    ).toBeInTheDocument();
    expect(screen.queryByText("Finalizar tarea")).not.toBeInTheDocument();
  });

  it("highlights the status label while the task is in progress", () => {
    mockedUseAssignmentDetailData.mockReturnValue(
      makeHookReturn({
        studentSubmission: inProgressSubmission,
        studentStatusLabel: "En progreso",
        isTaskInProgress: false,
      })
    );

    renderPage();

    expect(
      screen.getByText("En progreso", { exact: false })
    ).toHaveClass("assignment-status--progress");
  });

  it("highlights the pending status label in red", () => {
    const pendingSubmission = {
      id: 1,
      assignmentid: 1,
      userid: 1,
      status: "pending",
      repository_link: "",
      start_date: new Date(),
      end_date: new Date(),
      comment: "",
    };

    mockedUseAssignmentDetailData.mockReturnValue(
      makeHookReturn({
        studentSubmission: pendingSubmission,
        studentStatusLabel: "Pendiente",
      })
    );

    renderPage();

    expect(
      screen.getByText("Pendiente", { exact: false })
    ).toHaveClass("assignment-status--pending");
  });

  it("highlights the delivered status label in green", () => {
    mockedUseAssignmentDetailData.mockReturnValue(
      makeHookReturn({
        studentSubmission: deliveredSubmission,
        studentStatusLabel: "Enviado",
      })
    );

    renderPage();

    expect(
      screen.getByText("Enviado", { exact: false })
    ).toHaveClass("assignment-status--sent");
  });

  it("conserves the Asistente IA action when available", () => {
    mockedUseAssignmentDetailData.mockReturnValue(
      makeHookReturn({
        studentSubmission: inProgressSubmission,
        studentStatusLabel: "En progreso",
        isTaskInProgress: false,
      })
    );

    renderPage();

    expect(
      screen.getByRole("button", { name: /asistente ia/i })
    ).toBeInTheDocument();
  });
});
