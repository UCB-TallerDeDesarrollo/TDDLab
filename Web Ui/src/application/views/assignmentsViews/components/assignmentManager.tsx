import  { useState } from 'react';
import Formulario2 from "./assignmentForm";
import Tareas from "./assignmentTable";
import { styled } from '@mui/system'; 

const GestionTareasContainer = styled('section')({
  display: 'flex',
  width: '100%',
});

const TareasContainer = styled('div')({
  flex: '1',
  marginLeft: '16px',  
  marginRight: '20px',  
});

const FormularioContainer = styled('div')({
  flex: '1',
  marginLeft: '8px',  
  marginRight: '2px', 
});
function GestionTareas() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleMostrarFormulario = () => {
    setMostrarFormulario(true);
  };

  return (
    <GestionTareasContainer>
      <TareasContainer>
        <Tareas mostrarFormulario={handleMostrarFormulario} />
      </TareasContainer>
      <FormularioContainer>
        {mostrarFormulario && <Formulario2 />}
      </FormularioContainer>
    </GestionTareasContainer>
  );
}

export default GestionTareas;