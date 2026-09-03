import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import UserPage from "../../../src/presentation/users/pages/UserPage";

import {
  getGroupsService,
  getUsersService,
  removeUserFromGroupService,
  searchUsersByEmailService,
} from "../../../src/presentation/users/services/users.service";

// Polyfills requeridos por MUI (Popover/Select) en jsdom
beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

jest.mock("../../../src/presentation/users/services/users.service", () => ({
  getUsersService: jest.fn(),
  getGroupsService: jest.fn(),
  searchUsersByEmailService: jest.fn(),
  removeUserFromGroupService: jest.fn(),
}));

function asMock<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

const mockedGetUsersService = asMock(getUsersService);
const mockedGetGroupsService = asMock(getGroupsService);
const mockedSearchUsersByEmailService = asMock(searchUsersByEmailService);
const mockedRemoveUserFromGroupService = asMock(removeUserFromGroupService);

const users = [
  { id: 1, email: "ana@ucb.edu.bo", groupid: 10, role: "student" },
  { id: 2, email: "bruno@ucb.edu.bo", groupid: 11, role: "teacher" },
];

const groups = [
  { id: 10, groupName: "Grupo A" },
  { id: 11, groupName: "Grupo B" },
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

    const searchInput = await screen.findByRole("textbox", {
      name: /buscar por correo/i,
    });

    await waitFor(() => {
      expect(screen.getByText("ana@ucb.edu.bo")).toBeInTheDocument();
      expect(screen.getByText("bruno@ucb.edu.bo")).toBeInTheDocument();
    });

    await user.type(searchInput, "ana");

    await waitFor(() => {
      expect(screen.getByText("ana@ucb.edu.bo")).toBeInTheDocument();
      expect(screen.queryByText("bruno@ucb.edu.bo")).not.toBeInTheDocument();
    });
  });

  it("shows the empty state when the search has no matches", async () => {
    const user = userEvent.setup();

    render(<UserPage />);

    await user.click(
      await screen.findByRole("button", { name: /filtrar/i })
    );

    const searchInput = await screen.findByRole("textbox", {
      name: /buscar por correo/i,
    });

    await user.type(searchInput, "zzz");

    await waitFor(() => {
      expect(
        screen.getByText("No se encontraron resultados")
      ).toBeInTheDocument();
    });
  });
});