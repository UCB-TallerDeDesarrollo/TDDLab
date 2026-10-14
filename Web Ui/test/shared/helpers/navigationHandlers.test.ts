import {
  handleRedirectStudent,
  readTeacherSubmissions,
  saveTeacherSubmissions,
} from "../../../src/shared/helpers/navigationHandlers";

describe("teacher submissions navigation storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("saves and reads submissions scoped to an assignment", () => {
    const submissions = [
      { id: 12, repository_link: "https://github.com/student/repo" },
    ];

    saveTeacherSubmissions(7, submissions);

    expect(readTeacherSubmissions(7)).toEqual(submissions);
    expect(readTeacherSubmissions(8)).toEqual([]);
  });

  it("returns an empty list when there is no saved submission list", () => {
    expect(readTeacherSubmissions(7)).toEqual([]);
  });

  it("returns an empty list and logs an error for invalid stored JSON", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    sessionStorage.setItem("teacherSubmissions:7", "{invalid json");

    expect(readTeacherSubmissions(7)).toEqual([]);
    expect(consoleError).toHaveBeenCalledWith(
      "Error reading teacher submissions from session storage:",
      expect.any(SyntaxError),
    );

    consoleError.mockRestore();
  });

  it("rejects non-array and malformed stored submission data", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    sessionStorage.setItem("teacherSubmissions:7", JSON.stringify({ id: 12 }));
    expect(readTeacherSubmissions(7)).toEqual([]);

    sessionStorage.setItem(
      "teacherSubmissions:7",
      JSON.stringify([
        { id: 12, repository_link: "https://github.com/student/repo" },
        { id: "invalid", repository_link: "https://github.com/student/repo" },
      ]),
    );
    expect(readTeacherSubmissions(7)).toEqual([]);
    expect(consoleError).toHaveBeenCalledTimes(2);

    consoleError.mockRestore();
  });

  it.each([0, -1])("does not read or write submissions for invalid assignment ID %s", (assignmentId) => {
    saveTeacherSubmissions(assignmentId, [
      { id: 1, repository_link: "https://github.com/student/repo" },
    ]);

    expect(readTeacherSubmissions(assignmentId)).toEqual([]);
    expect(sessionStorage.length).toBe(0);
  });

  it("preserves the existing student graph redirect URL", () => {
    const navigate = jest.fn();
    const onError = jest.fn();

    handleRedirectStudent(
      "https://github.com/octocat/hello-world",
      10,
      navigate,
      onError,
    );

    expect(navigate).toHaveBeenCalledWith({
      pathname: "/graph",
      search: "repoOwner=octocat&repoName=hello-world&submissionId=10",
    });
    expect(onError).not.toHaveBeenCalled();
  });
});
