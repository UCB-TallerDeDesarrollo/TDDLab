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
import SortingComponent from "../GeneralPurposeComponents/SortingComponent";

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
});
const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
});

const CustomTableCell1 = styled(TableCell)({
  width: "80%",
});

const CustomTableCell2 = styled(TableCell)({
  width: "10%",
});

interface PracticesProps {
  ShowForm: () => void;
  userRole: string;
}

function Practices({ ShowForm: showForm, userRole }: Readonly<PracticesProps>) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<
    number | null
  >(null);
  const navigate = useNavigate();

  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [practices, setPractices] = useState<PracticeDataObject[]>([]);

  const practicesRepository = new PracticesRepository();
  const deletePractice = new DeletePractice(practicesRepository);

  const orderPractices = (
    practicesArray: PracticeDataObject[],
    sorting: string
  ) => {
    if (practicesArray.length > 0) {
      const sortedPractices = [...practicesArray].sort((a, b) => {
        switch (sorting) {
          case "A_Up_Order":
            return a.title.localeCompare(b.title);
          case "A_Down_Order":
            return b.title.localeCompare(a.title);
          case "Time_Up":
            return b.id - a.id;
          case "Time_Down":
            return a.id - b.id;
          default:
            return 0;
        }
      });
      setPractices(sortedPractices);
    }
  };
  const authData = useGlobalState("authData")[0];
  // Obtener prácticas
  const fetchData = async () => {
    try {
      const data = await practicesRepository.getPracticeByUserId(
        authData.userid
      );
      setPractices(data);
      orderPractices(data, selectedSorting);
    } catch (error) {
      console.error("Error fetching practices:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSorting]);

  const handleOrderPractices = (event: { target: { value: string } }) => {
    const sorting = event.target.value;
    setSelectedSorting(sorting);
    orderPractices(practices, sorting);
  };

  const handleClickDetail = (index: number) => {
    navigate(`/practices/${practices[index].id}`);
  };

  const handleClickDelete = (index: number) => {
    setSelectedPracticeIndex(index);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedPracticeIndex !== null) {
        const practiceToDelete = practices[selectedPracticeIndex];
        await deletePractice.DeletePractice(practiceToDelete.id);
        const updatedPractices = practices.filter(
          (_, i) => i !== selectedPracticeIndex
        );
        setPractices(updatedPractices);
      }
      setValidationDialogOpen(true);
    } catch (error) {
      console.error("Error deleting practice:", error);
    } finally {
      setConfirmationOpen(false);
    }
  };
  const handleRowHover = (index: number | null) => {
    setHoveredRow(index);
  };
  return (
    <Container>
      <section className="Tareas">
        <StyledTable>
          <TableHead>
            <TableRow>
              <CustomTableCell1>Tareas</CustomTableCell1>
              <CustomTableCell2>
                <ButtonContainer>
                  <SortingComponent
                    selectedSorting={selectedSorting}
                    onChangeHandler={handleOrderPractices}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={showForm}
                  >
                    Crear
                  </Button>
                </ButtonContainer>
              </CustomTableCell2>
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
                role={userRole}
              />
            ))}
          </TableBody>
        </StyledTable>
        {confirmationOpen && (
          <ConfirmationDialog
            open={confirmationOpen}
            title="¿Eliminar la tarea?"
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
            title="Tarea eliminada exitosamente"
            closeText="Cerrar"
            onClose={() => window.location.reload()}
          />
        )}
      </section>
    </Container>
  );
}

export default Practices;