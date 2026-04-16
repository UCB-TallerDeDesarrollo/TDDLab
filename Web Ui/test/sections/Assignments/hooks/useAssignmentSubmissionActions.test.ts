import { act, renderHook } from "@testing-library/react";
import { useAssignmentSubmissionActions } from "../../../../src/sections/Assignments/hooks/useAssignmentSubmissionActions";
import type { SubmissionDataObject } from "../../../../src/modules/Submissions/Domain/submissionInterfaces";

const createSubmissionMock = jest.fn();
const finishSubmissionMock = jest.fn();

jest.mock("../../../../src/modules/Submissions/Aplication/createSubmission", () => ({
  CreateSubmission: jest.fn().mockImplementation(() => ({
    createSubmission: createSubmissionMock,
  })),
}));

jest.mock("../../../../src/modules/Submissions/Aplication/finishSubmission", () => ({
  FinishSubmission: jest.fn().mockImplementation(() => ({
    finishSubmission: finishSubmissionMock,
  })),
}));

describe("useAssignmentSubmissionActions", () => {
  const onRefresh = jest.fn().mockResolvedValue(undefined);
  const onCloseLinkDialog = jest.fn();
  const onCloseCommentDialog = jest.fn();

  const baseSubmission: SubmissionDataObject = {
    id: 10,
    assignmentid: 4,
    userid: 7,
    status: "in progress",
    repository_link: "https://github.com/test/repo",
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-01-02"),
    comment: "",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a submission and refreshes state when sending a GitHub link", async () => {
    createSubmissionMock.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAssignmentSubmissionActions({
        assignmentId: 4,
        userId: 7,
        submission: baseSubmission,
        onRefresh,
        onCloseLinkDialog,
        onCloseCommentDialog,
      })
    );

    await act(async () => {
      await result.current.sendGithubLink("https://github.com/demo/project");
    });

    expect(createSubmissionMock).toHaveBeenCalledTimes(1);
    expect(createSubmissionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        assignmentid: 4,
        userid: 7,
        status: "in progress",
        repository_link: "https://github.com/demo/project",
      })
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onCloseLinkDialog).toHaveBeenCalledTimes(1);
  });

  it("finishes a submission and closes dialogs when sending a comment", async () => {
    finishSubmissionMock.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useAssignmentSubmissionActions({
        assignmentId: 4,
        userId: 7,
        submission: baseSubmission,
        onRefresh,
        onCloseLinkDialog,
        onCloseCommentDialog,
      })
    );

    await act(async () => {
      await result.current.sendComment("Done");
    });

    expect(finishSubmissionMock).toHaveBeenCalledTimes(1);
    expect(finishSubmissionMock).toHaveBeenCalledWith(
      10,
      expect.objectContaining({
        id: 10,
        status: "delivered",
        comment: "Done",
      })
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onCloseLinkDialog).toHaveBeenCalledTimes(1);
    expect(onCloseCommentDialog).toHaveBeenCalledTimes(1);
  });

  it("only closes comment dialog when there is no submission", async () => {
    const { result } = renderHook(() =>
      useAssignmentSubmissionActions({
        assignmentId: 4,
        userId: 7,
        submission: null,
        onRefresh,
        onCloseLinkDialog,
        onCloseCommentDialog,
      })
    );

    await act(async () => {
      await result.current.sendComment("No submission");
    });

    expect(finishSubmissionMock).not.toHaveBeenCalled();
    expect(onRefresh).not.toHaveBeenCalled();
    expect(onCloseLinkDialog).not.toHaveBeenCalled();
    expect(onCloseCommentDialog).toHaveBeenCalledTimes(1);
  });
});
