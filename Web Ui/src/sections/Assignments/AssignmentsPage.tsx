import Form from "./components/AssignmentForm";
import Assignments from "./components/AssignmentsList";
import InvitationComponent from "./components/EnrollmentLink";
import { styled } from '@mui/system'; 
import { useState } from "react";

const AssignmentManagerContainer = styled('section')({
  display: 'flex',
  width: '100%',
});

const AssignmentsContainer = styled('div')({
  flex: '1',
  marginLeft: '16px',  
  marginRight: '20px', 
});

const FormsContainer = styled('div')({
  flex: '1',
  marginLeft: '8px',  
  marginRight: '2px', 
  marginTop: '68px',
});
function AssignmentManager() {
  const [showForm, setShowForm] = useState(false);

  const handleShowForm = () => {
    setShowForm(true);
  };

  return (
    <AssignmentManagerContainer>
      <AssignmentsContainer data-testid="assignments-container">
        <Assignments ShowForm={handleShowForm} />
      </AssignmentsContainer>
      <FormsContainer>
        {showForm && <Form data-testid="form-container"/>}
        <InvitationComponent data-testid="invitation-component"/>
      </FormsContainer>
    </AssignmentManagerContainer>
  );
}

export default AssignmentManager;