import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { Table, TableHead, TableBody, TableRow, TableCell, Container, Button } from '@mui/material';
import { styled } from '@mui/system';

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

function Tareas() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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
                  <Button variant="outlined">Crear</Button>
                </ButtonContainer>
              </CustomTableCell2>
            </TableRow>
          </TableHead>
          <TableBody>
            {['Tarea 1', 'Tarea 2', 'Tarea 3'].map((tarea, index) => (
              <TableRow
                key={tarea}
                selected={isRowSelected(index)}
                onClick={() => handleRowClick(index)}
                onMouseEnter={() => handleRowHover(index)}
                onMouseLeave={() => handleRowHover(null)}
              >
                <TableCell>{tarea}</TableCell>
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
