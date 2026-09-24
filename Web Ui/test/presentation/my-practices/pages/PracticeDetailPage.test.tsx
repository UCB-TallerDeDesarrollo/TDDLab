import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import PracticeDetailPage from "../../../../src/presentation/my-practices/pages/PracticeDetailPage";
import { usePracticeDetail } from "../../../../src/presentation/my-practices/hooks/usePracticeDetail";

jest.mock(
  "../../../../src/presentation/my-practices/hooks/usePracticeDetail",
  () => ({
    usePracticeDetail: jest.fn(),
  }),
);

const mockedUsePracticeDetail = usePracticeDetail as jest.MockedFunction<
  typeof usePracticeDetail
>;

const practice = {
  id: 1,
  title: "Práctica de prueba",
  description: "desc",
  creation_date: new Date("2024-01-01"),
  state: "open",
  userid: 1,
};

function makeHookReturn(overrides: Partial<ReturnType<typeof usePracticeDetail>> = {}) {
  return {
    practiceState: "success" as const,
    submissionState: "success" as const,
    practice,
    practiceSubmissions: [],
    createdAt: "01/01/2024",
    statusLabel: "Pendiente",
    isTaskInProgress: true,
    isActionLoading: false,
    submission: null,
    linkDialogOpen: false,
    isCommentDialogOpen: false,
    openLinkDialog: jest.fn(),
    closeLinkDialog: jest.fn(),
    sendGithubLink: jest.fn(),
    openCommentDialog: jest.fn(),
    closeCommentDialog: jest.fn(),
    sendComment: jest.fn(),
    redirectToGraph: jest.fn(),
    uiMessage: null,
    closeUiMessage: jest.fn(),
    ...overrides,
  } as ReturnType<typeof usePracticeDetail>;
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <PracticeDetailPage userid={1} />
    </MemoryRouter>
  );

describe("PracticeDetailPage primary action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows only the start action (and Ver gráfica) when the submission is pending", () => {
    mockedUsePracticeDetail.mockReturnValue(
      makeHookReturn({ statusLabel: "Pendiente", isTaskInProgress: true }),
    );

    renderPage();

    expect(
      screen.getByRole("button", { name: /iniciar práctica/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ver gráfica/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /finalizar práctica/i }),
    ).not.toBeInTheDocument();
  });

  it("shows only the finish action (and Ver gráfica) when the submission is in progress", () => {
    mockedUsePracticeDetail.mockReturnValue(
      makeHookReturn({
        submission: {
          id: 2,
          practiceid: 1,
          userid: 1,
          status: "in progress",
          repository_link: "https://github.com/u/repo",
          start_date: new Date(),
          end_date: null,
          comment: null,
        },
        statusLabel: "En progreso",
        isTaskInProgress: false,
      }),
    );

    renderPage();

    expect(
      screen.getByRole("button", { name: /finalizar práctica/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ver gráfica/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /iniciar práctica/i }),
    ).not.toBeInTheDocument();
  });

  it("shows no Iniciar/Finalizar action for a delivered submission but keeps Ver gráfica", () => {
    mockedUsePracticeDetail.mockReturnValue(
      makeHookReturn({
        submission: {
          id: 2,
          practiceid: 1,
          userid: 1,
          status: "delivered",
          repository_link: "https://github.com/u/repo",
          start_date: new Date(),
          end_date: new Date(),
          comment: "ok",
        },
        statusLabel: "Enviado",
        isTaskInProgress: true,
      }),
    );

    renderPage();

    expect(
      screen.queryByRole("button", { name: /iniciar práctica/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /finalizar práctica/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ver gráfica/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Enviado")).toBeInTheDocument();
  });

  it("never renders both primary actions at the same time", () => {
    const states: (null | { status: string; link: string })[] = [
      null,
      { status: "in progress", link: "https://github.com/u/repo" },
      { status: "delivered", link: "https://github.com/u/repo" },
    ];

    states.forEach((submission) => {
      jest.clearAllMocks();
      mockedUsePracticeDetail.mockReturnValue(
        makeHookReturn({
          submission: submission
            ? {
                id: 2,
                practiceid: 1,
                userid: 1,
                status: submission.status,
                repository_link: submission.link,
                start_date: new Date(),
                end_date: null,
                comment: null,
              }
            : null,
          statusLabel: "Placeholder",
          isTaskInProgress: true,
        }),
      );

      const { unmount } = renderPage();
      const startBtn = screen.queryByRole("button", { name: /iniciar práctica/i });
      const finishBtn = screen.queryByRole("button", {
        name: /finalizar práctica/i,
      });
      expect(Boolean(startBtn) && Boolean(finishBtn)).toBe(false);
      unmount();
    });
  });

  it("shows a loading spinner on the primary action while saving", () => {
    mockedUsePracticeDetail.mockReturnValue(
      makeHookReturn({
        submission: {
          id: 2,
          practiceid: 1,
          userid: 1,
          status: "in progress",
          repository_link: "https://github.com/u/repo",
          start_date: new Date(),
          end_date: null,
          comment: null,
        },
        statusLabel: "En progreso",
        isTaskInProgress: false,
        isActionLoading: true,
      }),
    );

    renderPage();

    expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
    expect(
      screen.queryByText("Finalizar práctica"),
    ).not.toBeInTheDocument();
  });

  it("highlights the status label while the submission is in progress", () => {
    mockedUsePracticeDetail.mockReturnValue(
      makeHookReturn({
        submission: {
          id: 2,
          practiceid: 1,
          userid: 1,
          status: "in progress",
          repository_link: "https://github.com/u/repo",
          start_date: new Date(),
          end_date: null,
          comment: null,
        },
        statusLabel: "En progreso",
        isTaskInProgress: false,
      }),
    );

    renderPage();

    expect(screen.getByText("En progreso")).toHaveClass(
      "practice-status--progress",
    );
  });

  it("highlights the pending status label in red", () => {
    mockedUsePracticeDetail.mockReturnValue(
      makeHookReturn({
        submission: {
          id: 1,
          practiceid: 1,
          userid: 1,
          status: "pending",
          repository_link: "",
          start_date: new Date(),
          end_date: null,
          comment: null,
        },
        statusLabel: "Pendiente",
      }),
    );

    renderPage();

    expect(screen.getByText("Pendiente")).toHaveClass(
      "practice-status--pending",
    );
  });

  it("highlights the delivered status label in green", () => {
    mockedUsePracticeDetail.mockReturnValue(
      makeHookReturn({
        submission: {
          id: 2,
          practiceid: 1,
          userid: 1,
          status: "delivered",
          repository_link: "https://github.com/u/repo",
          start_date: new Date(),
          end_date: new Date(),
          comment: "ok",
        },
        statusLabel: "Enviado",
        isTaskInProgress: true,
      }),
    );

    renderPage();

    expect(screen.getByText("Enviado")).toHaveClass(
      "practice-status--sent",
    );
  });
});
