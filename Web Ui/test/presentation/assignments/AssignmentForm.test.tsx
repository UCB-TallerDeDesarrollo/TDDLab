import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AssignmentForm from "../../../src/presentation/assignments/components/AssignmentForm";

const mockGetGroups = jest.fn();

jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: () => [{ userid: 1, userRole: "admin" }],
}));
jest.mock("../../../src/modules/Groups/repository/GroupsRepository", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../../../src/modules/Groups/application/GetGroups", () => ({
  __esModule: true,
  default: jest.fn(() => ({ getGroups: mockGetGroups })),
}));
jest.mock("../../../src/presentation/assignments/components/DatePicker", () => ({
  __esModule: true,
  default: () => null,
}));

describe("AssignmentForm group loading", () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it("allows creation after groups load", async () => {
    mockGetGroups.mockResolvedValueOnce([{
      id: 5, groupName: "Grupo A", groupDetail: "", creationDate: new Date(),
    }]);
    render(<AssignmentForm open handleClose={jest.fn()} groupid={0} />);

    await waitFor(() => expect(mockGetGroups).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("Nombre de la Tarea*"), {
      target: { value: "Tarea nueva" },
    });

    await waitFor(() => expect(screen.getByRole("button", { name: "Crear" })).toBeEnabled());
  });

  it("keeps creation disabled when loading groups fails", async () => {
    const error = new Error("Groups unavailable");
    const logError = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetGroups.mockRejectedValueOnce(error);
    render(<AssignmentForm open handleClose={jest.fn()} groupid={5} />);

    await waitFor(() => expect(logError).toHaveBeenCalledWith("Error fetching groups:", error));
    fireEvent.change(screen.getByLabelText("Nombre de la Tarea*"), {
      target: { value: "Tarea nueva" },
    });

    expect(screen.getByRole("button", { name: "Crear" })).toBeDisabled();
  });
});
