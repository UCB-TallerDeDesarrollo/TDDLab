import SubmissionRepository from "../../../../src/modules/Submissions/Repository/SubmissionsRepository";
import { Pool } from "pg";
import { getSubmissionListMock, SubmissionInProgresDataMock } from "../../../__mocks__/submissions/dataTypeMocks/submissionData";

let repository: SubmissionRepository;
let poolConnectMock: jest.Mock;
let clientQueryMock: jest.Mock;

beforeEach(() => {
  poolConnectMock = jest.fn();
  clientQueryMock = jest.fn();
  poolConnectMock.mockResolvedValue({
    query: clientQueryMock,
    release: jest.fn(),
  });
  jest.spyOn(Pool.prototype, "connect").mockImplementation(poolConnectMock);
  repository = new SubmissionRepository();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function getSubmissionTestData(count: number) {
  return {
    rows: Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      assignmentid: 1,
      userid: 1,
      status: "pending",
      repository_link: `https://github.com/user/repo${i + 1}`,
      start_date: "2023-05-01",
      end_date: null,
      comment: null,
    })),
  };
}

describe("Obtain submissions", () => {
  it("should retrieve all submissions", async () => {
    clientQueryMock.mockResolvedValue(getSubmissionTestData(2));
    const submissions = await repository.ObtainSubmissions();
    expect(submissions).toHaveLength(2);
  });
  it("should handle errors when obtaining submissions", async () => {
    poolConnectMock.mockRejectedValue(new Error());
    await expect(repository.ObtainSubmissions()).rejects.toThrow();
  });
});

describe("Obtain submission by assignmentid and userid", () => {
  it("should retrieve an assignment by existing ids", async () => {
    clientQueryMock.mockResolvedValue(getSubmissionTestData(1));
    const submissions = await repository.getSubmissionByAssignmentAndUser(25,4);
    expect(submissions).not.toBeNull();
  });
  it("should handle errors when obtaining a submission by ids", async () => {
    poolConnectMock.mockRejectedValue(new Error());
    await expect(repository.getSubmissionByAssignmentAndUser(0,0)).rejects.toThrow();
  });
  it("should return null if no submission is found for the given assignmentid and userid", async () => {
    clientQueryMock.mockResolvedValue({ rows: [] });
    const submission = await repository.getSubmissionByAssignmentAndUser(25, 4);
    expect(submission).toBeNull();
  });
});

describe("Create submission", () => {
  it("should create a submission", async () => {
    clientQueryMock.mockResolvedValue({ rows: [SubmissionInProgresDataMock] });
    const newSubmission = SubmissionInProgresDataMock;
    const createdSubmission = await repository.CreateSubmission(newSubmission);
    expect(createdSubmission).toEqual(newSubmission);
  });
  it("should handle errors when creating a submission", async () => {
    poolConnectMock.mockRejectedValue(new Error());
    await expect(
      repository.CreateSubmission(SubmissionInProgresDataMock)
    ).rejects.toThrow();
  });
});

describe("Update submission", () => {
  it("should update a submission", async () => {
    clientQueryMock.mockResolvedValue({ rows: [SubmissionInProgresDataMock] });
    const updatedSubmission = await repository.UpdateSubmission(
      1,
      SubmissionInProgresDataMock
    );
    expect(updatedSubmission).toEqual(SubmissionInProgresDataMock);
  });
  it("should return null if no submission was found", async () => {
    clientQueryMock.mockResolvedValue({ rows: [] });
    const updatedSubmission = await repository.UpdateSubmission(
      1,
      SubmissionInProgresDataMock
    );
    expect(updatedSubmission).toBeNull();
  });
  it("should handle errors when updating a submission", async () => {
    poolConnectMock.mockRejectedValue(new Error());
    await expect(
      repository.UpdateSubmission(1, SubmissionInProgresDataMock)
    ).rejects.toThrow();
  });
});

describe("Delete submission", () => {
  it("should delete a submission", async () => {
    clientQueryMock.mockResolvedValue({ rowCount: 1 });
    const deletedSubmission = await repository.deleteSubmission(1);
    expect(deletedSubmission).toBeUndefined();
  });
  it("should handle errors when deleting a submission", async () => {
    poolConnectMock.mockRejectedValue(new Error());
    await expect(repository.deleteSubmission(1)).rejects.toThrow();
  });
});

describe("Get submissions by assignmentId", () => {
  it("should retrieve submissions for a specific assignmentId", async () => {
    const mockSubmissions = getSubmissionListMock();
    clientQueryMock.mockResolvedValue({ rows: mockSubmissions });
    const assignmentId = 25;
    const submissions = await repository.getSubmissionsByAssignmentId(assignmentId);
    expect(submissions).toHaveLength(mockSubmissions.length);
    submissions.forEach(submission => {
      expect(submission.assignmentid).toBe(assignmentId);
    });
  });

  it("should handle errors when retrieving submissions by assignmentId", async () => {
    poolConnectMock.mockRejectedValue(new Error());
    await expect(repository.getSubmissionsByAssignmentId(25)).rejects.toThrow();
  });

  it("should return an empty array if no submissions are found for the given assignmentId", async () => {
    clientQueryMock.mockResolvedValue({ rows: [] });
    const assignmentId = 25;
    const submissions = await repository.getSubmissionsByAssignmentId(assignmentId);
    expect(submissions).toHaveLength(0);
  });
  describe("Assignment ID exists for submission", () => {
    it("should return true if assignment ID exists", async () => {
      clientQueryMock.mockResolvedValue({ rows: [{ exists: true }] });
      const exists = await repository.assignmentidExistsForSubmission(1);
      expect(exists).toBe(true);
    });
    it("should return false if assignment ID does not exist", async () => {
      clientQueryMock.mockResolvedValue({ rows: [{ exists: false }] });
      const exists = await repository.assignmentidExistsForSubmission(1);
      expect(exists).toBe(false);
    });
    it("should handle errors when checking if assignment ID exists", async () => {
      poolConnectMock.mockRejectedValue(new Error());
      await expect(repository.assignmentidExistsForSubmission(1)).rejects.toThrow();
    });
  });

  describe("User ID exists for submission", () => {
    it("should return true if user ID exists", async () => {
      clientQueryMock.mockResolvedValue({ rows: [{ exists: true }] });
      const exists = await repository.useridExistsForSubmission(1);
      expect(exists).toBe(true);
    });
  });
  it("should return false if user ID does not exist", async () => {
    clientQueryMock.mockResolvedValue({ rows: [{ exists: false }] });
    const exists = await repository.useridExistsForSubmission(1);
    expect(exists).toBe(false);
  });
  it("should handle errors when checking if user ID exists", async () => {
    poolConnectMock.mockRejectedValue(new Error());
    await expect(repository.useridExistsForSubmission(1)).rejects.toThrow();
  });
});
