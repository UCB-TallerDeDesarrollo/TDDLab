import Form from "./components/AssignmentForm";
import Assignments from "./components/AssignmentsList";
import { styled } from '@mui/system'; 
import { useState } from "react";
import Navbar from "./components/Navbar";




const AssignmentManagerContainer = styled('section')({
  display: 'flex',
  width: '100%',
});

const AssignmentsContainer = styled('div')({
  flex: '1',
  marginLeft: '16px',  
  marginRight: '20px', 
  marginTop: '80px', 
});

const FormsContainer = styled('div')({
  flex: '1',
  marginLeft: '8px',  
  marginRight: '2px', 
  marginTop: '148px',
});
function AssignmentManager() {
  const [showForm, setShowForm] = useState(false);

  const handleShowForm = () => {
    setShowForm(true);
  };

  return (
    <AssignmentManagerContainer>
      <Navbar/>
      <AssignmentsContainer>
        <Assignments mostrarFormulario={handleShowForm}  />
      </AssignmentsContainer>
      <FormsContainer>
        {showForm && <Form/>}
      </FormsContainer>
    </AssignmentManagerContainer>
  );
}

export default AssignmentManager;