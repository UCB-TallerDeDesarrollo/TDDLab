import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import UserPage from "../../../src/features/users/pages/UserPage";

import {
  getGroupsService,
  getUsersService,
  removeUserFromGroupService,
  searchUsersByEmailService,
} from "../../../src/features/users/services/users.service";

jest.mock("../../../src/features/users/services/users.service", () => ({
  getUsersService: jest.fn(),
  getGroupsService: jest.fn(),
  searchUsersByEmailService: jest.fn(),
  removeUserFromGroupService: jest.fn(),
}));

const mockedGetUsersService = getUsersService as jest.MockedFunction<
  typeof getUsersService
>;
const mockedGetGroupsService = getGroupsService as jest.MockedFunction<
  typeof getGroupsService
>;
const mockedSearchUsersByEmailService =
  searchUsersByEmailService as jest.MockedFunction<
    typeof searchUsersByEmailService
  >;
const mockedRemoveUserFromGroupService =
  removeUserFromGroupService as jest.MockedFunction<
    typeof removeUserFromGroupService
  >;

const users = [
  {
    id: 1,
    email: "ana@ucb.edu.bo",
    groupid: 10,
    role: "student",
  },
  {
    id: 2,
    email: "bruno@ucb.edu.bo",
    groupid: 11,
    role: "teacher",
  },
];

const groups = [
  {
    id: 10,
    groupName: "Grupo A",
  },
  {
    id: 11,
    groupName: "Grupo B",
  },
];

describe("UserPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetUsersService.mockResolvedValue(users as never);
    mockedGetGroupsService.mockResolvedValue(groups as never);
    mockedRemoveUserFromGroupService.mockResolvedValue(undefined);
    mockedSearchUsersByEmailService.mockImplementation(
      async (query, groupId) => {
        return users.filter((user) => {
          const matchesGroup =
            groupId === "all" ? true : user.groupid === groupId;
          const matchesQuery = user.email
            .toLowerCase()
            .includes(query.toLowerCase());

          return matchesGroup && matchesQuery;
        });
      }
    );
  });

  it("renders the search field and filters users by email", async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    const filterButton = await screen.findByRole("button", {
      name: /filtrar/i,
    });

    await user.click(filterButton);

    expect(
      await screen.findByRole("textbox", { name: /buscar por correo/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("ana@ucb.edu.bo")).toBeInTheDocument();
      expect(screen.getByText("bruno@ucb.edu.bo")).toBeInTheDocument();
    });

    await user.type(
      screen.getByRole("textbox", { name: /buscar por correo/i }),
      "ana"
    );

    await waitFor(() => {
      expect(screen.getByText("ana@ucb.edu.bo")).toBeInTheDocument();
      expect(screen.queryByText("bruno@ucb.edu.bo")).not.toBeInTheDocument();
    });
  });

  it("shows the empty state when the search has no matches", async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    await user.click(
      await screen.findByRole("button", {
        name: /filtrar/i,
      })
    );

    const searchInput = await screen.findByRole("textbox", {
      name: /buscar por correo/i,
    });

    await user.type(searchInput, "zzz");

    await waitFor(() => {
      expect(screen.getByText("No se encontraron resultados")).toBeInTheDocument();
    });
  });
});
