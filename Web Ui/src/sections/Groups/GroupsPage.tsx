import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import GroupsIcon from '@mui/icons-material/Groups';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";

const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
});

const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
});

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
});

function Groups() {
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
    <CenteredContainer>
      <section className="Tareas">
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontWeight: 560, color: "#333", fontSize: "1rem" }}
              >
                Grupos{" "}
              </TableCell>
              <TableCell>
                <ButtonContainer>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: "17px" , textTransform: 'none',fontSize: "0.95rem" }}
                  >
                    Crear
                  </Button>
                </ButtonContainer>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {["Grupo 1", "Grupo 2", "Grupo 3"].map((tarea, index) => (
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
                    <Tooltip title="Tareas" arrow>
                      <IconButton aria-label="delete">
                        {" "}
                        <AutoAwesomeMotionIcon />{" "}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Alumnos" arrow>
                      <IconButton aria-label="send">
                        {" "}
                        <GroupsIcon />{" "}
                      </IconButton>
                    </Tooltip>
                  </ButtonContainer>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </section>
    </CenteredContainer>
  );
}

export default Groups;
