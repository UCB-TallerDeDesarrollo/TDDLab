import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useAssignmentDetail,
  useGroupDetail,
  useFeatureFlagEnabled,
  useSubmissionByUserAndAssignment,
  useAssignmentSubmissions,
  useStudentSubmission,
} from "../../../../src/sections/Assignments/hooks/useAssignmentDetailData";
import type { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";
import type { GroupDataObject } from "../../../../src/modules/Groups/domain/GroupInterface";
import type { SubmissionDataObject } from "../../../../src/modules/Submissions/Domain/submissionInterfaces";
import type { FeatureFlag } from "../../../../src/modules/FeatureFlags/domain/FeatureFlag";

const obtainAssignmentDetailMock = jest.fn();
const obtainGroupDetailMock = jest.fn();
const getFlagByNameMock = jest.fn();
const getSubmisssionByUserandSubmissionIdMock = jest.fn();
const getSubmissionsByAssignmentIdMock = jest.fn();

jest.mock("../../../../src/modules/Assignments/repository/AssignmentsRepository", () => {
  return jest.fn().mockImplementation(() => ({
    getAssignmentById: obtainAssignmentDetailMock,
  }));
});

jest.mock("../../../../src/modules/Groups/repository/GroupsRepository", () => {
  return jest.fn().mockImplementation(() => ({
    getGroupById: obtainGroupDetailMock,
  }));
});

jest.mock("../../../../src/modules/FeatureFlags/repository/FeatureFlagRepository", () => {
  return jest.fn().mockImplementation(() => ({
    getFlagByName: getFlagByNameMock,
  }));
});

jest.mock("../../../../src/modules/Submissions/Repository/SubmissionRepository", () => {
  return jest.fn().mockImplementation(() => ({
    getSubmissionbyUserandSubmissionId: getSubmisssionByUserandSubmissionIdMock,
    getSubmissionsByAssignmentId: getSubmissionsByAssignmentIdMock,
  }));
});

const sampleAssignment: AssignmentDataObject = {
  id: 1,
  title: "Tarea 1",
  description: "Descripcion de prueba",
  start_date: new Date("2026-01-01"),
  end_date: new Date("2026-01-15"),
  state: "active",
  link: "https://github.com/test/assignment",
  comment: null,
  groupid: 10,
};

const sampleGroup: GroupDataObject = {
  id: 10,
  groupName: "Grupo A",
  groupDetail: "Detalle del grupo",
  creationDate: new Date("2026-02-01"),
};

const sampleSubmission: SubmissionDataObject = {
  id: 50,
  assignmentid: 1,
  userid: 7,
  status: "in progress",
  repository_link: "https://github.com/user/repo",
  start_date: new Date("2026-03-01"),
  end_date: new Date("2026-03-15"),
  comment: "",
};

const sampleFlag: FeatureFlag = {
  id: 1,
  feature_name: "aiAssistant",
  is_enabled: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useAssignmentDetail", () => {
  it("should fetch and return assignment data on success", async () => {
    obtainAssignmentDetailMock.mockResolvedValue(sampleAssignment);

    const { result } = renderHook(() => useAssignmentDetail(1));

    expect(result.current).toBeNull();

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current).toEqual(sampleAssignment);
    });

    expect(obtainAssignmentDetailMock).toHaveBeenCalledWith(1);
  });

  it("should handle fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    obtainAssignmentDetailMock.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAssignmentDetail(1));

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(result.current).toBeNull();
    consoleSpy.mockRestore();
  });
});

describe("useGroupDetail", () => {
  it("should fetch and return group data when groupId is provided", async () => {
    obtainGroupDetailMock.mockResolvedValue(sampleGroup);

    const { result } = renderHook(() => useGroupDetail(10));

    expect(result.current).toBeNull();

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current).toEqual(sampleGroup);
    });

    expect(obtainGroupDetailMock).toHaveBeenCalledWith(10);
  });

  it("should skip fetch when groupId is undefined", async () => {
    const { result } = renderHook(() => useGroupDetail(undefined));

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(obtainGroupDetailMock).not.toHaveBeenCalled();
    expect(result.current).toBeNull();
  });

  it("should skip fetch when groupId is 0", async () => {
    const { result } = renderHook(() => useGroupDetail(0));

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(obtainGroupDetailMock).not.toHaveBeenCalled();
    expect(result.current).toBeNull();
  });

  it("should handle fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    obtainGroupDetailMock.mockRejectedValue(new Error("Group fetch failed"));

    const { result } = renderHook(() => useGroupDetail(10));

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(result.current).toBeNull();
    consoleSpy.mockRestore();
  });
});

describe("useFeatureFlagEnabled", () => {
  it("should fetch flag and set enabled when flag is active", async () => {
    getFlagByNameMock.mockResolvedValue(sampleFlag);

    const { result } = renderHook(() => useFeatureFlagEnabled("aiAssistant"));

    expect(result.current).toBe(false);

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(getFlagByNameMock).toHaveBeenCalledWith("aiAssistant");
  });

  it("should skip fetch when enabled option is false", async () => {
    const { result } = renderHook(() =>
      useFeatureFlagEnabled("aiAssistant", { enabled: false })
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getFlagByNameMock).not.toHaveBeenCalled();
    expect(result.current).toBe(false);
  });

  it("should use defaultValue when flag is not found and no fallback provided", async () => {
    getFlagByNameMock.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useFeatureFlagEnabled("nonExistent", { defaultValue: true })
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("should use fallbackValue when flag is not found", async () => {
    getFlagByNameMock.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useFeatureFlagEnabled("nonExistent", { defaultValue: false, fallbackValue: true })
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("should use flag is_enabled when flag exists, ignoring fallback", async () => {
    getFlagByNameMock.mockResolvedValue({ ...sampleFlag, is_enabled: false });

    const { result } = renderHook(() =>
      useFeatureFlagEnabled("aiAssistant", { defaultValue: true, fallbackValue: true })
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should handle fetch error and keep defaultValue", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    getFlagByNameMock.mockRejectedValue(new Error("Flag fetch failed"));

    const { result } = renderHook(() =>
      useFeatureFlagEnabled("aiAssistant", { defaultValue: false })
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(result.current).toBe(false);
    consoleSpy.mockRestore();
  });
});

describe("useSubmissionByUserAndAssignment", () => {
  it("should fetch submission when assignmentId and userId are valid", async () => {
    getSubmisssionByUserandSubmissionIdMock.mockResolvedValue(sampleSubmission);

    const { result } = renderHook(() =>
      useSubmissionByUserAndAssignment(1, 7)
    );

    expect(result.current.submission).toBeNull();

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.submission).toEqual(sampleSubmission);
    });

    expect(getSubmisssionByUserandSubmissionIdMock).toHaveBeenCalledWith(1, 7);
  });

  it("should skip fetch when userId is -1", async () => {
    const { result } = renderHook(() =>
      useSubmissionByUserAndAssignment(1, -1)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getSubmisssionByUserandSubmissionIdMock).not.toHaveBeenCalled();
    expect(result.current.submission).toBeNull();
  });

  it("should skip fetch when assignmentId is 0", async () => {
    const { result } = renderHook(() =>
      useSubmissionByUserAndAssignment(0, 7)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getSubmisssionByUserandSubmissionIdMock).not.toHaveBeenCalled();
    expect(result.current.submission).toBeNull();
  });

  it("should skip fetch when userId is 0", async () => {
    const { result } = renderHook(() =>
      useSubmissionByUserAndAssignment(1, 0)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getSubmisssionByUserandSubmissionIdMock).not.toHaveBeenCalled();
    expect(result.current.submission).toBeNull();
  });

  it("should skip fetch when assignmentId is negative", async () => {
    const { result } = renderHook(() =>
      useSubmissionByUserAndAssignment(-1, 7)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getSubmisssionByUserandSubmissionIdMock).not.toHaveBeenCalled();
    expect(result.current.submission).toBeNull();
  });

  it("should skip fetch when userId is negative (besides -1)", async () => {
    const { result } = renderHook(() =>
      useSubmissionByUserAndAssignment(1, -5)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getSubmisssionByUserandSubmissionIdMock).not.toHaveBeenCalled();
    expect(result.current.submission).toBeNull();
  });

  it("should handle fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    getSubmisssionByUserandSubmissionIdMock.mockRejectedValue(
      new Error("Submission fetch failed")
    );

    const { result } = renderHook(() =>
      useSubmissionByUserAndAssignment(1, 7)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(result.current.submission).toBeNull();
    consoleSpy.mockRestore();
  });

  it("should expose a refresh function to re-fetch submission", async () => {
    getSubmisssionByUserandSubmissionIdMock.mockResolvedValue(sampleSubmission);

    const { result } = renderHook(() =>
      useSubmissionByUserAndAssignment(1, 7)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.submission).toEqual(sampleSubmission);
    });

    getSubmisssionByUserandSubmissionIdMock.mockResolvedValue({
      ...sampleSubmission,
      status: "delivered",
    });

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.submission?.status).toBe("delivered");
    });

    expect(getSubmisssionByUserandSubmissionIdMock).toHaveBeenCalledTimes(2);
  });
});

describe("useAssignmentSubmissions", () => {
  it("should fetch submissions when enabled is true", async () => {
    getSubmissionsByAssignmentIdMock.mockResolvedValue([sampleSubmission]);

    const { result } = renderHook(() =>
      useAssignmentSubmissions(1, true)
    );

    expect(result.current.loading).toBe(true);

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.submissions).toEqual([sampleSubmission]);
    expect(result.current.error).toBeNull();
    expect(getSubmissionsByAssignmentIdMock).toHaveBeenCalledWith(1);
  });

  it("should skip fetch when enabled is false", async () => {
    const { result } = renderHook(() =>
      useAssignmentSubmissions(1, false)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getSubmissionsByAssignmentIdMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
    expect(result.current.submissions).toEqual([]);
  });

  it("should set error state when fetch fails", async () => {
    getSubmissionsByAssignmentIdMock.mockRejectedValue(
      new Error("Submissions fetch failed")
    );

    const { result } = renderHook(() =>
      useAssignmentSubmissions(1, true)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      "Error fetching submissions. Please try again later."
    );
    expect(result.current.submissions).toEqual([]);
  });

  it("should expose a refresh function to re-fetch submissions", async () => {
    getSubmissionsByAssignmentIdMock.mockResolvedValue([sampleSubmission]);

    const { result } = renderHook(() =>
      useAssignmentSubmissions(1, true)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.submissions).toHaveLength(1);
    });

    const updatedSubmission = { ...sampleSubmission, status: "delivered" };
    getSubmissionsByAssignmentIdMock.mockResolvedValue([updatedSubmission]);

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.submissions[0].status).toBe("delivered");
    });

    expect(getSubmissionsByAssignmentIdMock).toHaveBeenCalledTimes(2);
  });
});

describe("useStudentSubmission", () => {
  const allSubmissions: SubmissionDataObject[] = [
    { ...sampleSubmission, id: 50, userid: 7 },
    { ...sampleSubmission, id: 51, userid: 8 },
    { ...sampleSubmission, id: 52, userid: 9 },
  ];

  it("should find and return student submission when enabled is true", async () => {
    getSubmissionsByAssignmentIdMock.mockResolvedValue(allSubmissions);

    const { result } = renderHook(() =>
      useStudentSubmission(1, 8, true)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.studentSubmission?.userid).toBe(8);
    });

    expect(result.current.error).toBeNull();
    expect(getSubmissionsByAssignmentIdMock).toHaveBeenCalledWith(1);
  });

  it("should skip fetch when enabled is false", async () => {
    const { result } = renderHook(() =>
      useStudentSubmission(1, 7, false)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getSubmissionsByAssignmentIdMock).not.toHaveBeenCalled();
    expect(result.current.studentSubmission).toBeUndefined();
  });

  it("should skip fetch when userId is -1", async () => {
    const { result } = renderHook(() =>
      useStudentSubmission(1, -1, true)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getSubmissionsByAssignmentIdMock).not.toHaveBeenCalled();
    expect(result.current.studentSubmission).toBeUndefined();
  });

  it("should skip fetch when assignmentId is 0", async () => {
    const { result } = renderHook(() =>
      useStudentSubmission(0, 7, true)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getSubmissionsByAssignmentIdMock).not.toHaveBeenCalled();
    expect(result.current.studentSubmission).toBeUndefined();
  });

  it("should skip fetch when userId is 0", async () => {
    const { result } = renderHook(() =>
      useStudentSubmission(1, 0, true)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(getSubmissionsByAssignmentIdMock).not.toHaveBeenCalled();
    expect(result.current.studentSubmission).toBeUndefined();
  });

  it("should set error when fetch fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    getSubmissionsByAssignmentIdMock.mockRejectedValue(
      new Error("Fetch failed")
    );

    const { result } = renderHook(() =>
      useStudentSubmission(1, 7, true)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(
        "An error occurred while fetching the student submission."
      );
    });

    consoleSpy.mockRestore();
  });

  it("should not set studentSubmission when user has no submission in the list", async () => {
    getSubmissionsByAssignmentIdMock.mockResolvedValue(allSubmissions);

    const { result } = renderHook(() =>
      useStudentSubmission(1, 99, true)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(getSubmissionsByAssignmentIdMock).toHaveBeenCalled();
    });

    expect(result.current.studentSubmission).toBeUndefined();
  });

  it("should expose a refresh function to re-fetch student submission", async () => {
    getSubmissionsByAssignmentIdMock.mockResolvedValue(allSubmissions);

    const { result } = renderHook(() =>
      useStudentSubmission(1, 8, true)
    );

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    await waitFor(() => {
      expect(result.current.studentSubmission?.userid).toBe(8);
    });

    const updatedSubmissions = [
      ...allSubmissions,
      { ...sampleSubmission, id: 53, userid: 8, status: "delivered" },
    ];
    getSubmissionsByAssignmentIdMock.mockResolvedValue(updatedSubmissions);

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.studentSubmission?.status).toBe("delivered");
    });

    expect(getSubmissionsByAssignmentIdMock).toHaveBeenCalledTimes(2);
  });
});
