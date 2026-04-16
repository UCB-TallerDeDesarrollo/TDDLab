import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository";
import {
  Container,
  Button,
  Box,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import { IconifyIcon } from "../Shared/Components";
import { DeletePractice } from "../../modules/Practices/application/DeletePractice";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import PracticeCard from "./PracticeCard";
import SortingComponent from "../GeneralPurposeComponents/SortingComponent";
import { typographyVariants } from "../../styles/typography";
import { FullScreenLoader } from "../../components/FullScreenLoader";

const PracticesContainer = styled(Box)({
  width: "100%",
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "24px",
});

interface PracticesProps {
  ShowForm: () => void;
  userRole: string;
}

function Practices({ ShowForm: showForm }: Readonly<PracticesProps>) {
  const [authData] = useGlobalState("authData");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<
    number | null
  >(null);
  const navigate = useNavigate();

  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSorting, authData]);

  const handleOrderPractices = (event: { target: { value: string } }) => {
    const sorting = event.target.value;
    setSelectedSorting(sorting);
    orderPractices(practices, sorting);
  };

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

  if (isLoading) return <FullScreenLoader variant="page" />;

  return (
    <PracticesContainer>
      <section className="Practicas">
        {/* Encabezado */}
        <Box sx={{ marginBottom: "24px" }}>
          <div style={{ ...typographyVariants.h5, marginBottom: "20px" }}>
            Prácticas
          </div>

          {/* Controles */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <SortingComponent
              selectedSorting={selectedSorting}
              onChangeHandler={handleOrderPractices}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={
                <IconifyIcon
                  icon="mdi:plus"
                  width={20}
                  height={20}
                  color="white"
                  hoverColor="#e0e0e0"
                />
              }
              sx={{
                textTransform: "none",
                ...typographyVariants.paragraphMedium,
                transition: "all 0.175s ease-out",
                "&:hover": {
                  filter: "brightness(0.9)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
                "&:active": {
                  transform: "scale(0.97)",
                },
              }}
              onClick={showForm}
            >
              Crear
            </Button>
          </Box>
        </Box>

        {/* Listado apilado de tarjetas */}
        <Grid container spacing={2}>
          {practices.map((practice, index) => (
            <Grid item xs={12} key={practice.id}>
              <PracticeCard
                practice={practice}
                index={index}
                onClickDetail={handleClickDetail}
                onClickDelete={handleClickDelete}
              />
            </Grid>
          ))}
        </Grid>

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
    </PracticesContainer>
  );
}

export default Practices;
