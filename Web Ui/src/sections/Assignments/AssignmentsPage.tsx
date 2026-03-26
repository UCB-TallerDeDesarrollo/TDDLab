import Form from "./components/AssignmentForm";
import Assignments from "./components/AssignmentsList";
import { styled } from "@mui/system";
import { useState } from "react";

const AssignmentsContainer = styled("div")({
  justifyContent: "center",
  alignItems: "center",
});

const FormsContainer = styled("div")({
  flex: "1",
  marginLeft: "8px",
  marginRight: "2px",
  marginTop: "68px",
});

interface AssignmentManagerProps {
  userRole: string;
  userGroupid: number;
}
function AssignmentManager({
  userRole,
  userGroupid, // Recibir userGroupid como prop
}: Readonly<AssignmentManagerProps>) {
  const [createAssignmentPopupOpen, setCreateAssignmentPopupOpen] =
    useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleCreateAssignmentClick = () => {
    setCreateAssignmentPopupOpen(true);
  };

  const refreshAssignments = () => {
    setRefreshToken((prev) => prev + 1);
  };

  return (
    <>
      <AssignmentsContainer data-testid="assignments-container">
        <Assignments
          ShowForm={handleCreateAssignmentClick}
          userRole={userRole}
          userGroupid={userGroupid}
          onGroupChange={setSelectedGroupId}
          refreshToken={refreshToken}
        />
      </AssignmentsContainer>
      <FormsContainer>
      {createAssignmentPopupOpen && (
        <Form
          data-testid="form-container"
          open={createAssignmentPopupOpen}
          handleClose={() => setCreateAssignmentPopupOpen(false)}
          groupid={selectedGroupId ?? userGroupid}
          onCreated={refreshAssignments}
          />
        )}
      </FormsContainer>
    </>
  );
}

export default AssignmentManager;
