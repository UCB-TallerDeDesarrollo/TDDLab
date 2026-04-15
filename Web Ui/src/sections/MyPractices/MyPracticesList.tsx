import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository";
import {
  Box,
  Button,
  Container,
  Divider,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import AddIcon from "@mui/icons-material/Add";
import { DeletePractice } from "../../modules/Practices/application/DeletePractice";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import Practice from "./Practice";

interface PracticesProps {
  ShowForm: () => void;
  userRole: string;
  refreshToken: number;
}

function Practices({
  ShowForm: showForm,
  userRole,
  refreshToken,
}: Readonly<PracticesProps>) {
  const [authData] = useGlobalState("authData");
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
  }, [selectedSorting, authData, refreshToken]);

  useEffect(() => {
    const handlePracticeUpdated = () => {
      fetchData();
    };

    window.addEventListener("practice-updated", handlePracticeUpdated as EventListener);
    return () => {
      window.removeEventListener("practice-updated", handlePracticeUpdated as EventListener);
    };
  }, [selectedSorting, authData]);

  const handleOrderPractices = (event: SelectChangeEvent<string>) => {
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

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "100%",
        px: { xs: 2, sm: 6, md: 6, lg: 2 },
        pb: { xs: 4, md: 6 },
      }}
    >
      <Box
        component="section"
        className="Practicas"
        sx={{
          width: "100%",
          maxWidth: "1440px",
          mx: "auto",
          mt: { xs: 2, sm: 3, md: 4 },
          fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: { xs: 1.5, sm: 2 },
            pl: { xs: 2.5, sm: 4, md: 6 },
            pr: { xs: 2.5, sm: 3, md: 3.5 },
            py: { xs: 1.6, sm: 2, md: 2.4 },
            border: "2px solid #bcc3ca",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          <Typography
            component="h1"
            sx={{
              m: 0,
              color: "#062b49",
              width: { xs: "100%", md: "auto" },
              textAlign: { xs: "center", md: "left" },
              fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.45rem" },
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Prácticas
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              width: { xs: "100%", md: "100%" },
              justifyContent: { xs: "flex-end", md: "flex-end" },
              flexWrap: "wrap",
            }}
          >
            <Select
              value={selectedSorting}
              onChange={handleOrderPractices}
              displayEmpty
              inputProps={{ "aria-label": "Filtrar prácticas" }}
              sx={{
                minWidth: { xs: "100%", sm: 132 },
                height: 40,
                backgroundColor: "#efefef",
                color: "#202020",
                fontSize: "1rem",
                fontWeight: 600,
                borderRadius: "6px",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "#9ba1a8",
                },
                ".MuiSelect-select": {
                  px: 1.75,
                  py: 1,
                },
              }}
              renderValue={(value) => {
                if (!value) {
                  return "Filtrar";
                }

                const labels: Record<string, string> = {
                  A_Up_Order: "A-Z",
                  A_Down_Order: "Z-A",
                  Time_Up: "Recientes",
                  Time_Down: "Antiguos",
                };

                return labels[value] ?? "Filtrar";
              }}
            >
              <MenuItem value="">Filtrar</MenuItem>
              <MenuItem value="A_Up_Order">Orden alfabético ascendente</MenuItem>
              <MenuItem value="A_Down_Order">Orden alfabético descendente</MenuItem>
              <MenuItem value="Time_Up">Recientes</MenuItem>
              <MenuItem value="Time_Down">Antiguos</MenuItem>
            </Select>

            {userRole !== "student" && (
              <Button
                variant="contained"
                endIcon={<AddIcon />}
                onClick={showForm}
                sx={{
                  height: 40,
                  minWidth: { xs: "100%", sm: 116 },
                  px: 2.25,
                  borderRadius: "6px",
                  backgroundColor: "#1976d2",
                  boxShadow: "none",
                  color: "#ffffff",
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  '&:hover': {
                    backgroundColor: "#1565c0",
                    boxShadow: "none",
                  },
                }}
              >
                Crear
              </Button>
            )}
          </Stack>
        </Box>

        <Divider
          sx={{
            mt: { xs: 3.5, md: 5 },
            borderColor: "#d7d7d7",
            borderBottomWidth: 3,
          }}
        />

        <Stack
          spacing={0}
          sx={{
            mt: { xs: 3, md: 5 },
            overflow: "hidden",
            borderRadius: "8px",
          }}
        >
          {practices.map((practice, index) => (
            <Practice
              key={practice.id}
              practice={practice}
              index={index}
              handleClickDetail={handleClickDetail}
              handleClickDelete={handleClickDelete}
              handleRowHover={handleRowHover}
            />
          ))}
        </Stack>

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
            onClose={() => setValidationDialogOpen(false)}
          />
        )}
      </Box>
    </Container>
  );
}

export default Practices;
