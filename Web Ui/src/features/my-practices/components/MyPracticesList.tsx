import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Table, TableBody } from "@mui/material";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { ConfirmationDialog } from "../../../sections/Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../../../sections/Shared/Components/ValidationDialog";
import SortingComponent from "../../../sections/GeneralPurposeComponents/SortingComponent";
import { PracticeDataObject } from "../../../modules/Practices/domain/PracticeInterface";
import ActionButton from "../../../shared/components/ActionButton";
import ContentState from "../../../shared/components/ContentState";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";
import FeatureSectionDivider from "../../../shared/components/FeatureSectionDivider";
import PracticeRow from "./PracticeRow";
import MyPracticesListLayout from "./MyPracticesListLayout";
import {
  MyPracticesSortOption,
  MyPracticesViewState,
  PracticeListItemViewModel,
} from "../types/myPracticesScreen";

const StyledTable = styled(Table)({
  width: "100%",
  tableLayout: "fixed",
  borderCollapse: "separate",
  borderSpacing: "0 0",
});

const ListHeader = styled(Typography)({
  color: "#002346",
  fontSize: 24,
  fontWeight: 700,
  lineHeight: "29px",
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

  if (viewState === "loading") {
    return (
      <ContentState
        variant="loading"
        title="Cargando practicas"
        description="Se estan cargando las practicas disponibles."
      />
    );
  }

  if (viewState === "error") {
    return (
      <ContentState
        variant="error"
        title="No se pudieron cargar las practicas"
        description={error ?? "Intenta nuevamente en unos segundos."}
      />
    );
  }

  return (
    <MyPracticesListLayout>
      <FeaturePageHeader
        title="Practicas"
        actions={
          <>
            <SortingComponent
              selectedSorting={selectedSorting}
              onChangeHandler={handleOrderPractices}
              prototypeStyle
            />
            {canCreatePractices ? (
              <ActionButton
                startIcon={<AddIcon />}
                variantStyle="primary"
                onClick={onShowForm}
                disabled={isSaving}
              >
                Crear
              </ActionButton>
            ) : null}
          </>
        }
      />
      <FeatureSectionDivider />
      <ListHeader>Listado</ListHeader>
      {viewState === "empty" ? (
        <ContentState
          variant="empty"
          title="No hay practicas disponibles"
          description="Cuando existan practicas creadas, apareceran en este listado."
        />
      ) : (
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
      )}
      {confirmationOpen ? (
        <ConfirmationDialog
          open={confirmationOpen}
          title="Eliminar la practica?"
          content="Ten en cuenta que esta accion tambien eliminara todas las entregas asociadas."
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
    </MyPracticesListLayout>
  );
}
