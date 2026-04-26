import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PracticeListItem from "./PracticeListItem";
import CreatePracticeDialog from "./CreatePracticeDialog";
import { ConfirmationDialog } from "../../../sections/Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../../../sections/Shared/Components/ValidationDialog";
import { usePractices } from "../hooks/usePractices";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import { useState } from "react";

interface PracticesListProps {
  userRole: string;
  userid: number;
}

function PracticesList({ userRole, userid }: Readonly<PracticesListProps>) {
  const [authData] = useGlobalState("authData");
  const [_hoveredRow, setHoveredRow] = useState<number | null>(null);

  const {
    practices,
    listState,
    selectedSorting,
    confirmationOpen,
    validationDialogOpen,
    createFormOpen,
    handleOrderPractices,
    handleClickDetail,
    handleClickDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleCloseValidation,
    openCreateForm,
    closeCreateForm,
    refreshPractices,
  } = usePractices();

  if (listState === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress data-testid="loading-indicator" />
      </Box>
    );
  }

  if (listState === "error") {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">
          No se pudieron cargar las prácticas. Intenta nuevamente.
        </Typography>
      </Box>
    );
  }

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
              onChange={(e: SelectChangeEvent<string>) =>
                handleOrderPractices(e.target.value)
              }
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
                ".MuiOutlinedInput-notchedOutline": { borderColor: "#9ba1a8" },
                ".MuiSelect-select": { px: 1.75, py: 1 },
              }}
              renderValue={(value) => {
                if (!value) return "Filtrar";
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
                onClick={openCreateForm}
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
                  "&:hover": { backgroundColor: "#1565c0", boxShadow: "none" },
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

        {listState === "empty" ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography color="text.secondary">
              No tienes prácticas aún.
            </Typography>
          </Box>
        ) : (
          <Stack
            spacing={0}
            sx={{
              mt: { xs: 3, md: 5 },
              overflow: "hidden",
              borderRadius: "8px",
            }}
          >
            {practices.map((practice, index) => (
              <PracticeListItem
                key={practice.id}
                practice={practice}
                index={index}
                handleClickDetail={handleClickDetail}
                handleClickDelete={handleClickDelete}
                handleRowHover={setHoveredRow}
              />
            ))}
          </Stack>
        )}

        {confirmationOpen && (
          <ConfirmationDialog
            open={confirmationOpen}
            title="¿Eliminar la practica?"
            content="Ten en cuenta que esta acción también eliminará todas las entregas asociadas."
            cancelText="Cancelar"
            deleteText="Eliminar"
            onCancel={handleCancelDelete}
            onDelete={handleConfirmDelete}
          />
        )}

        {validationDialogOpen && (
          <ValidationDialog
            open={validationDialogOpen}
            title="Practica eliminada exitosamente"
            closeText="Cerrar"
            onClose={handleCloseValidation}
          />
        )}
      </Box>

      {createFormOpen && (
        <CreatePracticeDialog
          open={createFormOpen}
          handleClose={closeCreateForm}
          userid={userid || authData.userid || 0}
          onCreated={refreshPractices}
        />
      )}
    </Container>
  );
}

export default PracticesList;
