import Formulario from "./components/AssignmentForm";
import Tareas from "./AssignmentsList";
import { styled } from '@mui/system'; 
import { useState } from "react";




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
        <Tareas mostrarFormulario={handleMostrarFormulario}  />
      </TareasContainer>
      <FormularioContainer>
        {mostrarFormulario && <Formulario/>}
      </FormularioContainer>
    </GestionTareasContainer>
  );
}

export default GestionTareas;