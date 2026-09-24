import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AssignmentsPage from "../../../src/presentation/assignments/pages/AssignmentsPage";
import { useAssignmentsScreen } from "../../../src/presentation/assignments/hooks/useAssignmentsScreen";

jest.mock("../../../src/presentation/assignments/hooks/useAssignmentsScreen", () => ({
  useAssignmentsScreen: jest.fn(),
}));

jest.mock("../../../src/presentation/assignments/components/AssignmentsFilterPopover", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../../src/presentation/assignments/components/AssignmentForm", () => ({
  __esModule: true,
  default: () => <div>Formulario de tarea</div>,
}));

const mockedUseAssignmentsScreen = useAssignmentsScreen as jest.MockedFunction<
  typeof useAssignmentsScreen
>;

function buildAssignmentsScreen(overrides = {}) {
  return {
    assignments: [],
    authData: {
      userid: 1,
      userEmail: "student@example.com",
      userProfilePic: "",
      userRole: "student",
      usergroupid: 1,
    },
    confirmationOpen: false,
    error: null,
    feedbackMessage: "",
    feedbackSeverity: "success" as const,
    groupList: [],
    handleClickDelete: jest.fn(),
    handleClickDetail: jest.fn(),
    handleConfirmDelete: jest.fn(),
    handleGroupChange: jest.fn(),
    handleOrderAssignments: jest.fn(),
    isLoading: false,
    safariCookieDialogOpen: true,
    selectedGroup: 0,
    selectedSorting: "" as const,
    setConfirmationOpen: jest.fn(),
    setFeedbackMessage: jest.fn(),
    setSafariCookieDialogOpen: jest.fn(),
    setValidationDialogOpen: jest.fn(),
    showCreateButton: false,
    showSafariCookieWarning: true,
    validationDialogOpen: false,
    ...overrides,
  };
}

describe("AssignmentsPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows Safari cookie instructions when the hook reports a cookie warning", () => {
    mockedUseAssignmentsScreen.mockReturnValue(buildAssignmentsScreen());

    render(<AssignmentsPage userRole="student" userGroupid={1} />);

    expect(
      screen.getByText("Habilita cookies para ver tus tareas"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Safari puede estar bloqueando cookies o datos de sesión/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Ver instrucciones")).toBeInTheDocument();
  });

  it("allows users to reopen Safari cookie instructions after closing them", () => {
    const setSafariCookieDialogOpen = jest.fn();
    mockedUseAssignmentsScreen.mockReturnValue(
      buildAssignmentsScreen({
        safariCookieDialogOpen: false,
        setSafariCookieDialogOpen,
      }),
    );

    render(<AssignmentsPage userRole="student" userGroupid={1} />);

    fireEvent.click(screen.getByText("Ver instrucciones"));

    expect(setSafariCookieDialogOpen).toHaveBeenCalledWith(true);
  });
});
