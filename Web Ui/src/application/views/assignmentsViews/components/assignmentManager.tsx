import Formulario2 from "../../assignmentsViews/createAssignmentView/assignmentForm";
import Tareas from "./assignmentTable";
import { styled } from '@mui/system'; 

const GestionTareasContainer = styled('section')({
    display: 'flex',
    width: '100%',
});

  const TareasContainer = styled('div')({
    flex: '1', 
   
  });
  
  const FormularioContainer = styled('div')({
    flex: '1',
  });


  function GestionTareas() {
    return (
      <GestionTareasContainer>
        <TareasContainer>
          <Tareas />
        </TareasContainer>
        <FormularioContainer>
          <Formulario2 />
        </FormularioContainer>
      </GestionTareasContainer>
    
    );
  }
  
  export default GestionTareas;
  