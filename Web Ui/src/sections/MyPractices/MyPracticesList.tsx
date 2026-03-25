import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  CircularProgress,
  Table,
  TableBody,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";
import { PracticeDataObject } from "../../modules/Practices/domain/PracticeInterface";
import AddIcon from "@mui/icons-material/Add";
import { ConfirmationDialog } from "../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../Shared/Components/ValidationDialog";
import Practice from "./Practice";
import SortingComponent from "../GeneralPurposeComponents/SortingComponent";
import { MyPracticesViewState } from "./types/myPractices.types";

const PageRoot = styled("div")({
  width: "100%",
  display: "flex",
  justifyContent: "center",
});

const PageSection = styled("section")({
  width: "min(1301px, calc(100vw - 40px))",
  maxWidth: "1301px",
  marginTop: "46px",
});

const StyledTable = styled(Table)({
  width: "100%",
  tableLayout: "fixed",
  borderCollapse: "separate",
  borderSpacing: "0 0",
});

const HeaderActions = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  minHeight: "69px",
  border: "1.5px solid #898989",
  borderRadius: "5px",
  padding: "8px 18px",
  flexWrap: "wrap",
  rowGap: "8px",
});

const HeaderTitle = styled("h2")({
  fontFamily: "Inter, sans-serif",
  fontStyle: "normal",
  fontWeight: 700,
  fontSize: "clamp(22px, 2.2vw, 24px)",
  lineHeight: "29px",
  margin: 0,
  color: "#002346",
});

const HeaderButtons = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginLeft: "auto",
  flexShrink: 0,
});

const DividerBar = styled("div")({
  width: "100%",
  height: "5px",
  background: "#D9D9D9",
  borderRadius: "13px",
  marginTop: "34px",
  marginBottom: "34px",
});

const StateContainer = styled("div")({
  width: "100%",
  marginTop: "2rem",
  display: "flex",
  justifyContent: "center",
});

interface PracticesProps {
  ShowForm: () => void;
  practices: PracticeDataObject[];
  selectedSorting: string;
  isSaving: boolean;
  viewState: MyPracticesViewState;
  error: string | null;
  canManagePractices: boolean;
  canCreatePractices: boolean;
  onRetry: () => Promise<void>;
  onSortChange: (sorting: "" | "A_Up_Order" | "A_Down_Order" | "Time_Up" | "Time_Down") => void;
  onDeletePractice: (practiceId: number) => Promise<void>;
  onPracticeUpdated: (practice: PracticeDataObject) => Promise<void>;
}

function Practices({
  ShowForm: showForm,
  practices,
  selectedSorting,
  isSaving,
  viewState,
  error,
  canManagePractices,
  canCreatePractices,
  onRetry,
  onSortChange,
  onDeletePractice,
  onPracticeUpdated,
}: Readonly<PracticesProps>) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationTitle, setValidationTitle] = useState("Practica eliminada exitosamente");
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState<
    number | null
  >(null);
  const navigate = useNavigate();

  const handleOrderPractices = (event: { target: { value: string } }) => {
    onSortChange(event.target.value as "" | "A_Up_Order" | "A_Down_Order" | "Time_Up" | "Time_Down");
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
        await onDeletePractice(practices[selectedPracticeIndex].id);
        setValidationTitle("Practica eliminada exitosamente");
      } else {
        setValidationTitle("Error al eliminar la practica");
      }
    } catch (error) {
      console.error(error);
      setValidationTitle("Error al eliminar la practica");
    }
    setValidationDialogOpen(true);
    setConfirmationOpen(false);
  };

  if (viewState === "loading") {
    return (
      <PageRoot>
        <PageSection>
          <StateContainer>
            <CircularProgress />
          </StateContainer>
        </PageSection>
      </PageRoot>
    );
  }

  if (viewState === "error") {
    return (
      <PageRoot>
        <PageSection>
          <StateContainer>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={onRetry}>
                  Reintentar
                </Button>
              }
            >
              {error ?? "No pudimos cargar tus practicas"}
            </Alert>
          </StateContainer>
        </PageSection>
      </PageRoot>
    );
  }

  if (viewState === "empty") {
    return (
      <PageRoot>
        <PageSection className="Practicas">
          <HeaderActions>
            <HeaderTitle>Practicas</HeaderTitle>
            <HeaderButtons>
              <SortingComponent
                selectedSorting={selectedSorting}
                onChangeHandler={handleOrderPractices}
                prototypeStyle
              />
              {canCreatePractices && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={showForm}
                  disabled={isSaving}
                  sx={{
                    height: "34px",
                    minWidth: "88px",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "14px",
                    lineHeight: "17px",
                    backgroundColor: "#1370D2",
                    borderRadius: "5px",
                    boxShadow: "none",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#0D63BE",
                      boxShadow: "none",
                    },
                  }}
                >
                  Crear
                </Button>
              )}
            </HeaderButtons>
          </HeaderActions>
          <DividerBar />
          <StateContainer>
            <Alert severity="info">Todavia no tenes practicas creadas.</Alert>
          </StateContainer>
        </PageSection>
      </PageRoot>
    );
  }

  return (
    <PageRoot>
      <PageSection className="Practicas">
        <HeaderActions>
          <HeaderTitle>Practicas</HeaderTitle>
          <HeaderButtons>
            <SortingComponent
              selectedSorting={selectedSorting}
              onChangeHandler={handleOrderPractices}
              prototypeStyle
            />
            {canCreatePractices && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={showForm}
                disabled={isSaving}
                sx={{
                  height: "34px",
                  minWidth: "88px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "14px",
                  lineHeight: "17px",
                  backgroundColor: "#1370D2",
                  borderRadius: "5px",
                  boxShadow: "none",
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: "#0D63BE",
                    boxShadow: "none",
                  },
                }}
              >
                Crear
              </Button>
            )}
          </HeaderButtons>
        </HeaderActions>
        <DividerBar />
        <StyledTable>
          <TableBody>
            {practices.map((practice, index) => (
              <Practice
                key={practice.id}
                practice={practice}
                index={index}
                handleClickDetail={handleClickDetail}
                handleClickDelete={handleClickDelete}
                canManagePractices={canManagePractices}
                onPracticeUpdated={onPracticeUpdated}
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
            title={validationTitle}
            closeText="Cerrar"
            onClose={() => setValidationDialogOpen(false)}
          />
        )}
      </PageSection>
    </PageRoot>
  );
}

export default Practices;
