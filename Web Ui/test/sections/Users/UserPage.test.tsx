import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UserPage from "../../../src/sections/User/UserPage";
import "@testing-library/jest-dom";
import GetUsers from "../../../src/modules/Users/application/getUsers";
import GetGroups from "../../../src/modules/Groups/application/GetGroups";
import { UserDataObject } from "../../../src/modules/Users/domain/UsersInterface";
import { GroupDataObject } from "../../../src/modules/Groups/domain/GroupInterface";

jest.mock("../../../src/modules/Users/application/getUsers");
jest.mock("../../../src/modules/Groups/application/GetGroups");

const mockUsers: UserDataObject[] = [
  { id: 1, email: "user1@example.com", role: "admin", groupid: 1 },
  { id: 2, email: "user2@example.com", role: "user", groupid: 2 },
];

const mockGroups: GroupDataObject[] = [
  {
    id: 1,
    groupName: "Group1",
    groupDetail: "Detail1",
    creationDate: new Date(),
  },
  {
    id: 2,
    groupName: "Group2",
    groupDetail: "Detail2",
    creationDate: new Date(),
  },
];

describe("UserPage component", () => {
  beforeEach(() => {
    (GetUsers.prototype.getUsers as jest.Mock).mockResolvedValue(mockUsers);
    (GetGroups.prototype.getGroups as jest.Mock).mockResolvedValue(mockGroups);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders users table after successful data fetch", async () => {
    render(<UserPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("Group1")).toBeInTheDocument();
      expect(screen.getByText("admin")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
      expect(screen.getByText("Group2")).toBeInTheDocument();
      expect(screen.getByText("user")).toBeInTheDocument();
    });
  });

  it("filters users when selecting a group", async () => {
    render(<UserPage />);
    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });

    const selectElement = screen.getByLabelText(/Grupo/i);
    fireEvent.mouseDown(selectElement);

    const menuItem = await screen.findAllByRole("option");
    fireEvent.click(menuItem[1]);

    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.queryByText("user2@example.com")).not.toBeInTheDocument();
    });

    fireEvent.mouseDown(selectElement);
    const allGroupsItem = await screen.findByText("Todos los grupos");
    fireEvent.click(allGroupsItem);
    await waitFor(() => {
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });
    
  });

  it("displays error message if fetching users fails", async () => {
    (GetUsers.prototype.getUsers as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch users")
    );

    render(<UserPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error: Failed to fetch users/i)
      ).toBeInTheDocument();
    });
  });
});
