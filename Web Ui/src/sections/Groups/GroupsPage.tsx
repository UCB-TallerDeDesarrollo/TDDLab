import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import GroupsIcon from "@mui/icons-material/Groups";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import { ConfirmationDialog } from "../Assignments/components/ConfirmationDialog";
import { ValidationDialog } from "../Assignments/components/ValidationDialog";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
  Button,
  Collapse,
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
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false); 

  const handleRowClick = (index: number) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((row) => row !== index));
    } else {
      setExpandedRows([index]);
    }
    setSelectedRow(index);
  };

  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };

  const isRowSelected = (index: number) => {
    return index === selectedRow || index === hoveredRow;
  };

  const handleHomeworksClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    setSelectedRow(index);
  };

  const handleStudentsClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    setSelectedRow(index);
  };

  const handleDeleteClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    setSelectedRow(index);
    setConfirmationOpen(true);
  };

  const handleLinkClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    event.stopPropagation();
    console.log(index)
  };

  const handleConfirmDelete = () => {
    console.log(`Eliminar grupo ${selectedRow}`);
    setConfirmationOpen(false);
    // Abre el ValidationDialog
    setValidationDialogOpen(true);
  };

  const handleValidationDialogClose = () => {
    // Cierra el ValidationDialog
    setValidationDialogOpen(false);
  };

  return (
    <CenteredContainer>
      <section className="Grupos">
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
                    sx={{
                      borderRadius: "17px",
                      textTransform: "none",
                      fontSize: "0.95rem",
                    }}
                  >
                    Crear
                  </Button>
                </ButtonContainer>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {["Grupo 1", "Grupo 2", "Grupo 3"].map((grupo, index) => (
              <React.Fragment key={grupo}>
                <TableRow
                  selected={isRowSelected(index)}
                  onClick={() => handleRowClick(index)}
                  onMouseEnter={() => handleRowHover(index)}
                  onMouseLeave={() => handleRowHover(null)}
                >
                  <TableCell>{grupo}</TableCell>
                  <TableCell>
                    <ButtonContainer>
                      <Tooltip title="Tareas" arrow>
                        <IconButton
                          aria-label="tareas"
                          onClick={(event) =>
                            handleHomeworksClick(event, index)
                          }
                        >
                          <AutoAwesomeMotionIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Estudiantes" arrow>
                        <IconButton
                          aria-label="estudiantes"
                          onClick={(event) => handleStudentsClick(event, index)}
                        >
                          <GroupsIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar grupo" arrow>
                        <IconButton
                          aria-label="eliminar"
                          onClick={(event) => handleDeleteClick(event, index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copiar enlace de invitacion" arrow>
                        <IconButton
                          aria-label="enlace"
                          onClick={(event) => handleLinkClick(event, index)}
                        >
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                    </ButtonContainer>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ width: "100%", padding: 0, margin: 0 }}
                    colSpan={2}
                  >
                    <Collapse
                      in={expandedRows.includes(index)}
                      timeout="auto"
                      unmountOnExit
                    >
                      <div
                        style={{
                          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                          borderRadius: "2px",
                        }}
                      >
                        <div style={{ padding: "50px", marginLeft: "-30px" }}>
                          Contenido adicional para la fila {grupo}
                        </div>
                      </div>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </StyledTable>
      </section>

      {confirmationOpen && (
        <ConfirmationDialog
          open={confirmationOpen}
          title="¿Eliminar el grupo?"
          content={
            <>
              Ten en cuenta que esta acción también eliminará <br /> todas las tareas y estudiantes asociados.
            </>
          }
          cancelText="Cancelar"
          deleteText="Eliminar"
          onCancel={() => setConfirmationOpen(false)}
          onDelete={handleConfirmDelete}
        />
      )}

      {/* ValidationDialog */}
      {validationDialogOpen && (
        <ValidationDialog
          open={validationDialogOpen}
          title="Tarea eliminada exitosamente"
          closeText="Cerrar"
          onClose={handleValidationDialogClose}
        />
      )}
    </CenteredContainer>
  );
}

export default Groups;
