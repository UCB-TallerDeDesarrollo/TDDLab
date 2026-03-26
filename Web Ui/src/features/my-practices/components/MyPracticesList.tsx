import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Button,
  CircularProgress,
  Table,
  TableBody,
} from "@mui/material";
import { styled } from "@mui/system";
import { ConfirmationDialog } from "../../../sections/Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../../../sections/Shared/Components/ValidationDialog";
import SortingComponent from "../../../sections/GeneralPurposeComponents/SortingComponent";
import { PracticeDataObject } from "../../../modules/Practices/domain/PracticeInterface";
import PracticeRow from "./PracticeRow";
import {
  MyPracticesSortOption,
  MyPracticesViewState,
  PracticeListItemViewModel,
} from "../types/myPracticesScreen";

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

interface MyPracticesListProps {
  practices: PracticeListItemViewModel[];
  selectedSorting: MyPracticesSortOption;
  isSaving: boolean;
  viewState: MyPracticesViewState;
  error: string | null;
  canManagePractices: boolean;
  canCreatePractices: boolean;
  onShowForm: () => void;
  onRetry: () => Promise<void>;
  onSortChange: (sorting: MyPracticesSortOption) => void;
  onOpenDetail: (practiceId: number) => void;
  onDeletePractice: (practiceId: number) => Promise<void>;
  onPracticeUpdated: (practice: PracticeDataObject) => Promise<void>;
}

export default function MyPracticesList({
  practices,
  selectedSorting,
  isSaving,
  viewState,
  error,
  canManagePractices,
  canCreatePractices,
  onShowForm,
  onRetry,
  onSortChange,
  onOpenDetail,
  onDeletePractice,
  onPracticeUpdated,
}: Readonly<MyPracticesListProps>) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationTitle, setValidationTitle] = useState(
    "Practica eliminada exitosamente",
  );
  const [selectedPracticeId, setSelectedPracticeId] = useState<number | null>(
    null,
  );

  const handleOrderPractices = (event: { target: { value: string } }) => {
    onSortChange(event.target.value as MyPracticesSortOption);
  };

  const handleClickDelete = (practiceId: number) => {
    setSelectedPracticeId(practiceId);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedPracticeId !== null) {
        await onDeletePractice(selectedPracticeId);
        setValidationTitle("Practica eliminada exitosamente");
      } else {
        setValidationTitle("Error al eliminar la practica");
      }
    } catch (deleteError) {
      console.error(deleteError);
      setValidationTitle("Error al eliminar la practica");
    }

    setValidationDialogOpen(true);
    setConfirmationOpen(false);
  };

  const header = (
    <HeaderActions>
      <HeaderTitle>Practicas</HeaderTitle>
      <HeaderButtons>
        <SortingComponent
          selectedSorting={selectedSorting}
          onChangeHandler={handleOrderPractices}
          prototypeStyle
        />
        {canCreatePractices ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onShowForm}
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
        ) : null}
      </HeaderButtons>
    </HeaderActions>
  );

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
          {header}
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
        {header}
        <DividerBar />
        <StyledTable>
          <TableBody>
            {practices.map((practice) => (
              <PracticeRow
                key={practice.id}
                practice={practice}
                canManagePractices={canManagePractices}
                onOpenDetail={onOpenDetail}
                onDeletePractice={handleClickDelete}
                onPracticeUpdated={onPracticeUpdated}
              />
            ))}
          </TableBody>
        </StyledTable>
        {confirmationOpen ? (
          <ConfirmationDialog
            open={confirmationOpen}
            title="Â¿Eliminar la practica?"
            content="Ten en cuenta que esta acciÃ³n tambiÃ©n eliminarÃ¡ todas las entregas asociadas."
            cancelText="Cancelar"
            deleteText="Eliminar"
            onCancel={() => setConfirmationOpen(false)}
            onDelete={handleConfirmDelete}
          />
        ) : null}
        {validationDialogOpen ? (
          <ValidationDialog
            open={validationDialogOpen}
            title={validationTitle}
            closeText="Cerrar"
            onClose={() => setValidationDialogOpen(false)}
          />
        ) : null}
      </PageSection>
    </PageRoot>
  );
}
