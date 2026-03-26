import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository";
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
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import AddIcon from "@mui/icons-material/Add";
import { DeletePractice } from "../../modules/Practices/application/DeletePractice";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import Practice from "./Practice";

const StyledTable = styled(Table)({
  width: "100%",
  marginLeft: "0",
  marginRight: "0",
});

interface PracticesProps {
  ShowForm: () => void;
  userRole: string;
}

function Practices({ ShowForm: showForm }: Readonly<PracticesProps>) {
  const [authData] = useGlobalState("authData");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<
    number | null
  >(null);
  const navigate = useNavigate();

  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [practices, setPractices] = useState<PracticeDataObject[]>([]);

  const practicesRepository = new PracticesRepository();
  const deletePractice = new DeletePractice(practicesRepository);

  // Obtener prácticas

  const fetchData = async () => {
    try {
      const data = await practicesRepository.getPracticeByUserId(
        authData.userid
      );
      setPractices(data);
    } catch (error) {
      console.error("Error fetching practices:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authData]);

  const handleClickDetail = (index: number) => {
    navigate(`/mis-practicas/${practices[index].id}`);
  };

  const handleClickDelete = (index: number) => {
    setSelectedPracticeIndex(index);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedPracticeIndex !== null && practices[selectedPracticeIndex]) {
        
        await deletePractice.DeletePractice(
          practices[selectedPracticeIndex].id
        );
        const updatedPractices = [...practices];
        updatedPractices.splice(selectedPracticeIndex, 1);
        setPractices(updatedPractices);
      }
      setConfirmationOpen(false);
    } catch (error) {
      console.error(error);
    }
    setValidationDialogOpen(true);
    setConfirmationOpen(false);
  };

  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };
  return (
    <div style={{ width: "95%", padding: "0 16px", margin: "0 auto" }}>
      <section className="Practicas" style={{ width: "100%", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            paddingTop: "6px",
            borderBottom: "1px solid #D1D5DB",
            paddingBottom: "16px",
            width: "100%",
          }}
        >
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: "24px" }}>Practicas</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Button
              variant="outlined"
              color="primary"
              style={{
                textTransform: "none",
                minWidth: "88px",
                borderColor: "#D1D5DB",
                color: "#1F2937",
                backgroundColor: "white",
                boxShadow: "none",
              }}
            >
              Filtrar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={showForm}
              style={{ textTransform: "none", minWidth: "100px" }}
            >
              Crear +
            </Button>
          </div>
        </div>
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} sx={{ borderBottom: "1px solid #D1D5DB" }}>
                <div style={{ fontWeight: 600, fontSize: "16px" }}>Listado</div>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {practices.map((practice, index) => (
              <Practice
                key={practice.id}
                practice={practice}
                index={index}
                handleClickDetail={handleClickDetail}
                handleClickDelete={handleClickDelete}
                handleRowHover={handleRowHover}
                isHovered={_hoveredRow === index}
              />
            ))}
          </TableBody>
        </StyledTable>
        {confirmationOpen && (
          <ConfirmationDialog
            open={confirmationOpen}
            title="¿Eliminar la practica?"
            content="Ten en cuenta que esta acción también eliminará todas las entregas asociadas."
            cancelText="Cancelar"
            deleteText="Eliminar"
            onCancel={() => setConfirmationOpen(false)}
            onDelete={handleConfirmDelete}
          />
        )}
        {validationDialogOpen && (
          <ValidationDialog
            open={validationDialogOpen}
            title="Practica eliminada exitosamente"
            closeText="Cerrar"
            onClose={() => window.location.reload()}
          />
        )}
      </section>
    </div>
  );
}

export default Practices;
