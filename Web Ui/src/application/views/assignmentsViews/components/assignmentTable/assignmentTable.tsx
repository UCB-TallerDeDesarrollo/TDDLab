import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { Table, TableHead, TableBody, TableRow, TableCell, Container, Button } from '@mui/material';
import { styled } from '@mui/system';
import { AssignmentDataObject } from '../../../../../domain/models/assignmentInterfaces'; // Import your assignment model


const ButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
});

const CustomTableCell1 = styled(TableCell)({
  width: '90%',
});

const CustomTableCell2 = styled(TableCell)({
  width: '10%',
});
interface TareasProps {
  mostrarFormulario: () => void,
}
function Tareas({ mostrarFormulario  }: TareasProps) {



  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<AssignmentDataObject[]>([]); // Specify the type as Assignment[]

  useEffect(() => {
    // Fetch assignments from the database (You need to implement this)
    // For example, you can use the Fetch API or a library like axios
    // Replace the placeholder URL with your actual API endpoint
    fetch('http://localhost:3000/api/assignment/get')
      .then((response) => response.json())
      .then((data) => {
        setAssignments(data); // Set the fetched assignments in state
      })
      .catch((error) => {
        console.error('Error fetching assignments:', error);
      });
  }, []); // Empty dependency array means this effect runs once when the component mounts

  const handleRowClick = (index: number) => {
    setSelectedRow(index);
  };

  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };

  const isRowSelected = (index: number) => {
    return index === selectedRow || index === hoveredRow;
  };
  return (
    <Container>
      <section className="Tareas">
        <Table>
          <TableHead>
            <TableRow>
              <CustomTableCell1>Tarea </CustomTableCell1>
              <CustomTableCell2>
                <ButtonContainer>
                  <Button variant="outlined" onClick={mostrarFormulario}>Crear</Button>
                </ButtonContainer>
              </CustomTableCell2>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment, index) => (
              <TableRow
                key={assignment.id}
                selected={isRowSelected(index)}
                onClick={() => handleRowClick(index)}
                onMouseEnter={() => handleRowHover(index)}
                onMouseLeave={() => handleRowHover(null)}
              >
                <TableCell>{assignment.title}</TableCell>
                <TableCell>
                  <ButtonContainer>
                    <IconButton aria-label="see"> <VisibilityIcon />  </IconButton>
                    <IconButton aria-label="edit"> <EditIcon />  </IconButton>
                    <IconButton aria-label="delete"> <DeleteIcon />  </IconButton>
                    <IconButton aria-label="send"> <SendIcon />  </IconButton>
                  </ButtonContainer>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </Container>
  );
}

export default Tareas;