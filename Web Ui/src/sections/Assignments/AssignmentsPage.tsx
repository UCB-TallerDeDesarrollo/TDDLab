import Form from "./components/AssignmentForm";
import Assignments from "./components/AssignmentsList";
import { styled } from "@mui/system";
import { useState } from "react";

const AssignmentManagerContainer = styled("section")({
  display: "flex",
  width: "100%",
});

const AssignmentsContainer = styled("div")({
  flex: "1",
  marginLeft: "16px",
  marginRight: "20px",
});

const FormsContainer = styled("div")({
  flex: "1",
  marginLeft: "8px",
  marginRight: "2px",
  marginTop: "68px",
});
function AssignmentManager() {
  const [createAssignmentPopupOpen, setCreateAssignmentPopupOpen] =
    useState(false);

  const handleCreateAssignmentClick = () => {
    setCreateAssignmentPopupOpen(true);
  };

  return (
    <AssignmentManagerContainer>
      <AssignmentsContainer data-testid="assignments-container">
        <Assignments ShowForm={handleCreateAssignmentClick} />
      </AssignmentsContainer>
      <FormsContainer>
        {createAssignmentPopupOpen && (
          <Form
            data-testid="form-container"
            open={createAssignmentPopupOpen}
            handleClose={() => setCreateAssignmentPopupOpen(false)}
          />
        )}
      </FormsContainer>
    </AssignmentManagerContainer>
  );
}

export default AssignmentManager;
