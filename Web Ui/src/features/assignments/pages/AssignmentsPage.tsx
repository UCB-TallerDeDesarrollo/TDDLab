import { useState } from "react";
import { styled } from "@mui/system";
import Form from "../../../sections/Assignments/components/AssignmentForm";
import AssignmentsList from "../components/AssignmentsList";
import { AssignmentScreenProps } from "../types/assignmentScreen";

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

function AssignmentsPage({
  userRole,
  userGroupid,
}: Readonly<AssignmentScreenProps>) {
  const [createAssignmentPopupOpen, setCreateAssignmentPopupOpen] =
    useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleCreateAssignmentClick = () => {
    setCreateAssignmentPopupOpen(true);
  };

  return (
    <>
      <AssignmentsContainer data-testid="assignments-container">
        <AssignmentsList
          ShowForm={handleCreateAssignmentClick}
          userRole={userRole}
          userGroupid={userGroupid}
          onGroupChange={setSelectedGroupId}
        />
      </AssignmentsContainer>
      <FormsContainer>
        {createAssignmentPopupOpen && (
          <Form
            data-testid="form-container"
            open={createAssignmentPopupOpen}
            handleClose={() => setCreateAssignmentPopupOpen(false)}
            groupid={
              selectedGroupId ??
              (Number(localStorage.getItem("selectedGroup") ?? NaN) ||
                userGroupid)
            }
          />
        )}
      </FormsContainer>
    </>
  );
}

export default AssignmentsPage;
