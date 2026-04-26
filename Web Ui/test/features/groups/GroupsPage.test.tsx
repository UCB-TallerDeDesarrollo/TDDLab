import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

import GroupsPage from "../../../src/features/groups/pages/GroupsPage";
import { useGroupsData } from "../../../src/features/groups/hooks/useGroupsData";

jest.mock("../../../src/features/groups/hooks/useGroupsData", () => ({
  useGroupsData: jest.fn(),
}));

const mockedUseGroupsData = useGroupsData as jest.MockedFunction<
  typeof useGroupsData
>;

describe("GroupsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseGroupsData.mockReturnValue({
      groups: [
        {
          id: 1,
          name: "whitebox",
          description: "Descripcion real del grupo",
          creationDate: new Date("2026-04-26"),
        },
      ],
      loading: false,
      error: false,
      currentSelectedGroupId: 1,
      selectedSorting: "",
      selectAndSync: jest.fn(),
      handleGroupsOrder: jest.fn(),
      deleteGroupItem: jest.fn(),
      createGroup: jest.fn().mockResolvedValue(undefined),
      updateGroup: jest.fn().mockResolvedValue(undefined),
      copyTeacherLink: jest.fn(),
      copyStudentLink: jest.fn(),
      goToParticipants: jest.fn(),
    });
  });

  it("renders shared header controls", () => {
    render(
      <MemoryRouter>
        <GroupsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /crear/i })).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /ordenar/i }),
    ).toBeInTheDocument();
  });

  it("opens the edit popup with the current description preloaded", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GroupsPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByLabelText("edit-group"));

    expect(
      await screen.findByDisplayValue("Descripcion real del grupo"),
    ).toBeInTheDocument();
  });
});
