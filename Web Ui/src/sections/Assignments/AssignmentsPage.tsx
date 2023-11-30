import Form from "./components/AssignmentForm";
import Assignments from "./components/AssignmentsList";
import InvitationComponent from "./components/EnrollmentLink";
import { styled } from '@mui/system'; 
import { useState } from "react";



const AssignmentsContainer = styled('div')({
  justifyContent: "center",
  alignItems: "center",  

});

const FormsContainer = styled('div')({
  flex: '1',
  marginLeft: '8px',  
  marginRight: '2px', 
  marginTop: '68px',
});
function AssignmentManager() {
  const [createAssignmentPopupOpen, setCreateAssignmentPopupOpen] = useState(false);

  const handleCreateAssignmentClick = () => {
    setCreateAssignmentPopupOpen(true);
  };

  return (
    <>
      <AssignmentsContainer data-testid="assignments-container">
        <Assignments ShowForm={handleCreateAssignmentClick} />
      </AssignmentsContainer>
      <FormsContainer>
        {createAssignmentPopupOpen && <Form data-testid="form-container" open={createAssignmentPopupOpen} handleClose={() => setCreateAssignmentPopupOpen(false)} />}
        <InvitationComponent data-testid="invitation-component"/>
      </FormsContainer>
    </>
  
  );
}

export default AssignmentManager;