import {
  createDialogHandlers,
  createLinkDialogHandlers,
  handleRedirectStudent,
  handleRedirectAdmin,
} from "../../../src/sections/Shared/handlers";
import type { SubmissionDataObject } from "../../../src/modules/Submissions/Domain/submissionInterfaces";

describe("handlers", () => {
  let mockSetDialogState: jest.Mock;

  const originalLocation = window.location;

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: jest.fn() }
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    });
  });

  beforeEach(() => {
    mockSetDialogState = jest.fn();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    (window.location.reload as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createDialogHandlers", () => {
    it("should return openDialog and closeDialog functions", () => {
      const handlers = createDialogHandlers(mockSetDialogState);
      expect(handlers).toHaveProperty("openDialog");
      expect(handlers).toHaveProperty("closeDialog");
      expect(typeof handlers.openDialog).toBe("function");
      expect(typeof handlers.closeDialog).toBe("function");
    });

    it("openDialog should call setDialogState with true", () => {
      const { openDialog } = createDialogHandlers(mockSetDialogState);
      openDialog();
      expect(mockSetDialogState).toHaveBeenCalledWith(true);
    });

    it("closeDialog should call setDialogState with false", () => {
      const { closeDialog } = createDialogHandlers(mockSetDialogState);
      closeDialog();
      expect(mockSetDialogState).toHaveBeenCalledWith(false);
    });
  });

  describe("createLinkDialogHandlers", () => {
    it("should return openDialog and closeDialog functions", () => {
      const handlers = createLinkDialogHandlers(mockSetDialogState);
      expect(handlers).toHaveProperty("openDialog");
      expect(handlers).toHaveProperty("closeDialog");
    });

    it("openDialog should call setDialogState with true", () => {
      const { openDialog } = createLinkDialogHandlers(mockSetDialogState);
      openDialog();
      expect(mockSetDialogState).toHaveBeenCalledWith(true);
    });

    it("closeDialog should call setDialogState with false and reload window", () => {
      const { closeDialog } = createLinkDialogHandlers(mockSetDialogState);
      closeDialog();
      expect(mockSetDialogState).toHaveBeenCalledWith(false);
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe("handleRedirectStudent", () => {
    let mockNavigate: jest.Mock;

    beforeEach(() => {
      mockNavigate = jest.fn();
    });

    it("should navigate to /graph with correct params for valid GitHub link", () => {
      const link = "https://github.com/user123/my-repo";
      const id = 42;

      handleRedirectStudent(link, id, mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: "/graph",
        search: "repoOwner=user123&repoName=my-repo&submissionId=42",
      });
    });

    it("should navigate with submissionId as string", () => {
      const link = "https://github.com/owner/project";
      const id = 7;

      handleRedirectStudent(link, id, mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: "/graph",
        search: "repoOwner=owner&repoName=project&submissionId=7",
      });
    });

    it("should alert for invalid (non-GitHub) link", () => {
      const link = "https://gitlab.com/user/repo";

      handleRedirectStudent(link, 1, mockNavigate);

      expect(window.alert).toHaveBeenCalledWith(
        "Link Inválido, por favor ingrese un link válido."
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should alert for empty string link", () => {
      handleRedirectStudent("", 1, mockNavigate);

      expect(window.alert).toHaveBeenCalledWith(
        "No se encontró un link para esta tarea."
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should alert for random string that is not a GitHub URL", () => {
      handleRedirectStudent("not-a-url", 1, mockNavigate);

      expect(window.alert).toHaveBeenCalledWith(
        "Link Inválido, por favor ingrese un link válido."
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should alert for GitHub-like URL with extra path segments", () => {
      const link = "https://github.com/user/repo/extra/path";

      handleRedirectStudent(link, 1, mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: "/graph",
        search: expect.stringContaining("repoOwner=user&repoName=repo"),
      });
    });
  });

  describe("handleRedirectAdmin", () => {
    let mockNavigate: jest.Mock;
    let mockSubmissions: SubmissionDataObject[];

    beforeEach(() => {
      mockNavigate = jest.fn();
      mockSubmissions = [
        {
          id: 1,
          assignmentid: 10,
          userid: 5,
          status: "delivered",
          repository_link: "https://github.com/user/repo",
          start_date: new Date("2024-01-01"),
          end_date: new Date("2024-01-10"),
          comment: "",
        },
      ];
    });

    it("should navigate to provided url with correct params for valid GitHub link", () => {
      const link = "https://github.com/admin-owner/admin-repo";
      const submissionId = 99;
      const url = "/admin/graph";

      handleRedirectAdmin(link, mockSubmissions, submissionId, url, mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: "/admin/graph",
        search: expect.stringContaining("repoOwner=admin-owner"),
      });
    });

    it("should include stringified submissions in search params", () => {
      const link = "https://github.com/owner/repo";

      handleRedirectAdmin(link, mockSubmissions, 5, "/admin", mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: "/admin",
        search: expect.stringContaining("fetchedSubmissions=" + JSON.stringify(mockSubmissions)),
      });
    });

    it("should include submissionId in search params", () => {
      const link = "https://github.com/owner/repo";

      handleRedirectAdmin(link, mockSubmissions, 123, "/admin", mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: "/admin",
        search: expect.stringContaining("submissionId=123"),
      });
    });

    it("should alert for invalid (non-GitHub) link", () => {
      const link = "https://gitlab.com/user/repo";

      handleRedirectAdmin(link, mockSubmissions, 1, "/admin", mockNavigate);

      expect(window.alert).toHaveBeenCalledWith(
        "Link Invalido, por favor ingrese un link valido."
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should alert for empty link", () => {
      handleRedirectAdmin("", mockSubmissions, 1, "/admin", mockNavigate);

      expect(window.alert).toHaveBeenCalledWith(
        "No se encontro un link para esta tarea."
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should alert for random non-URL string", () => {
      handleRedirectAdmin("something-random", mockSubmissions, 1, "/admin", mockNavigate);

      expect(window.alert).toHaveBeenCalledWith(
        "Link Invalido, por favor ingrese un link valido."
      );
    });

    it("should handle empty submissions array", () => {
      const link = "https://github.com/owner/repo";

      handleRedirectAdmin(link, [], 1, "/admin", mockNavigate);

      expect(mockNavigate).toHaveBeenCalledWith({
        pathname: "/admin",
        search: expect.stringContaining("fetchedSubmissions=[]"),
      });
    });
  });
});
