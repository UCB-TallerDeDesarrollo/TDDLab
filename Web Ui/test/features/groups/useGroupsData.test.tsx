import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { useGroupsData } from "../../../src/features/groups/hooks/useGroupsData";

const setAuthDataMock = jest.fn();
const registerMock = jest.fn();
const mockGetByUser = jest.fn();
const mockGetAll = jest.fn();
const mockDelete = jest.fn();
const createGroupMock = jest.fn();
const updateGroupMock = jest.fn();

jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: jest.fn(() => [
    {
      userid: 7,
      userEmail: "docente@ucb.edu.bo",
      userRole: "teacher",
      usergroupid: 1,
    },
    setAuthDataMock,
  ]),
}));

jest.mock("../../../src/features/groups/services", () => ({
  groupsService: {
    getByUser: (...args: unknown[]) => mockGetByUser(...args),
    getAll: (...args: unknown[]) => mockGetAll(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

jest.mock("../../../src/modules/Groups/application/GetCourseLink", () => ({
  getCourseLink: jest.fn(),
}));

jest.mock("../../../src/modules/Users/repository/UsersRepository", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../../src/modules/Users/application/getUsersByGroupid", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    execute: jest.fn(),
  })),
}));

jest.mock(
  "../../../src/modules/User-Authentication/application/registerUserOnDb",
  () => ({
    RegisterUserOnDb: jest
      .fn()
      .mockImplementation(function RegisterUserOnDb(this: { register: (...args: unknown[]) => unknown }) {
      this.register = (...args: unknown[]) => registerMock(...args);
      }),
  }),
);

jest.mock("../../../src/modules/Groups/repository/GroupsRepository", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../../src/modules/Groups/application/CreateGroup", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    createGroup: createGroupMock,
  })),
}));

jest.mock("../../../src/modules/Groups/application/UpdateGroup", () => ({
  UpdateGroup: jest.fn(() => ({
    updateGroup: updateGroupMock,
  })),
}));

function GroupsHarness() {
  const { groups, createGroup, updateGroup } = useGroupsData();

  return (
    <>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            {group.name}|{group.description ?? ""}
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          createGroup({
            name: "Nuevo grupo",
            description: "Descripcion creada",
          })
        }
      >
        crear grupo
      </button>
      <button
        onClick={() =>
          updateGroup({
            id: 1,
            name: "Grupo editado",
            description: "Descripcion editada",
          })
        }
      >
        editar grupo
      </button>
    </>
  );
}

describe("useGroupsData", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetByUser.mockResolvedValue([
      {
        id: 1,
        name: "Grupo base",
        description: "Descripcion base",
        creationDate: new Date("2026-04-26"),
      },
    ]);
    mockGetAll.mockResolvedValue([]);
    mockDelete.mockResolvedValue(undefined);
    registerMock.mockResolvedValue(undefined);
    createGroupMock.mockResolvedValue({
      id: 2,
      groupName: "Nuevo grupo",
      groupDetail: "Descripcion creada",
      creationDate: new Date("2026-04-27"),
    });
    updateGroupMock.mockResolvedValue(undefined);
  });

  it("keeps description in local state after creating a group", async () => {
    const user = userEvent.setup();

    render(<GroupsHarness />);

    await waitFor(() => {
      expect(screen.getByText("Grupo base|Descripcion base")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /crear grupo/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Nuevo grupo|Descripcion creada"),
      ).toBeInTheDocument();
    });

    expect(registerMock).toHaveBeenCalledWith({
      email: "docente@ucb.edu.bo",
      groupid: 2,
      role: "teacher",
    });
  });

  it("keeps description in local state after editing a group", async () => {
    const user = userEvent.setup();

    render(<GroupsHarness />);

    await waitFor(() => {
      expect(screen.getByText("Grupo base|Descripcion base")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /editar grupo/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Grupo editado|Descripcion editada"),
      ).toBeInTheDocument();
    });

    expect(updateGroupMock).toHaveBeenCalledWith(1, {
      id: 1,
      groupName: "Grupo editado",
      groupDetail: "Descripcion editada",
      creationDate: new Date("2026-04-26"),
    });
  });
});
