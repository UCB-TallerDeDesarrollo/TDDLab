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
      <AssignmentsContainer>
        <Assignments mostrarFormulario={handleShowForm} />
      </AssignmentsContainer>
      <FormsContainer>
        {showForm && <Form />}
        <InvitationComponent />
      </FormsContainer>
    </AssignmentManagerContainer>
  );
}

export default AssignmentManager;