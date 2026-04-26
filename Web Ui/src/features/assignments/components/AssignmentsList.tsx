import { useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ActionButton from "../../../shared/components/ActionButton";
import ConfirmationDialog from "../../../shared/components/ConfirmationDialog";
import ContentState from "../../../shared/components/ContentState";
import FeedbackSnackbar from "../../../shared/components/FeedbackSnackbar";
import FeatureItemsLayout from "../../../shared/components/FeatureItemsLayout";
import FeatureListSection from "../../../shared/components/FeatureListSection";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";
import FeatureSectionDivider from "../../../shared/components/FeatureSectionDivider";
import ValidationDialog from "../../../shared/components/ValidationDialog";
import { useAssignmentsScreen } from "../hooks/useAssignmentsScreen";
import { AssignmentListProps } from "../types/assignmentScreen";
import AssignmentRow from "./AssignmentRow";
import AssignmentsFilterPopover from "./AssignmentsFilterPopover";

const LoadingContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "60vh",
});

function AssignmentsList({
  ShowForm: showForm,
  userRole,
  userGroupid,
  onGroupChange,
}: Readonly<AssignmentListProps>) {
  const {
    assignments,
    confirmationOpen,
    error,
    feedbackMessage,
    feedbackSeverity,
    groupList,
    handleClickDelete,
    handleClickDetail,
    handleConfirmDelete,
    handleGroupChange,
    handleOrderAssignments,
    isLoading,
    selectedGroup,
    selectedSorting,
    setConfirmationOpen,
    setFeedbackMessage,
    setValidationDialogOpen,
    showCreateButton,
    validationDialogOpen,
  } = useAssignmentsScreen({
    ShowForm: showForm,
    userRole,
    userGroupid,
    onGroupChange,
  });

  const [filtersAnchorEl, setFiltersAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const canManageAssignments = userRole === "teacher" || userRole === "admin";

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  return (
    <>
      <FeaturePageHeader
        title="Tareas"
        actions={
          <>
            <ActionButton
              endIcon={<KeyboardArrowDownIcon />}
              variantStyle="secondary"
              onClick={(event) => setFiltersAnchorEl(event.currentTarget)}
            >
              Filtrar
            </ActionButton>
            {showCreateButton ? (
              <ActionButton
                startIcon={<AddIcon />}
                variantStyle="primary"
                onClick={showForm}
              >
                Crear
              </ActionButton>
            ) : null}
          </>
        }
      />
      <FeatureSectionDivider />

      <FeatureListSection>
        {error ? (
          <ContentState
            variant="error"
            title="No se pudieron cargar las tareas"
            description={error.message}
          />
        ) : assignments.length === 0 ? (
          <ContentState
            variant="empty"
            title="No hay tareas disponibles"
            description="Cuando existan tareas para el grupo seleccionado, apareceran en este listado."
          />
        ) : (
          <FeatureItemsLayout>
            {assignments.map((assignment) => (
              <AssignmentRow
                key={assignment.id}
                item={assignment}
                canManage={canManageAssignments}
                onDelete={handleClickDelete}
                onView={handleClickDetail}
              />
            ))}
          </FeatureItemsLayout>
        )}
      </FeatureListSection>

      <AssignmentsFilterPopover
        anchorEl={filtersAnchorEl}
        groupList={groupList}
        onClose={() => setFiltersAnchorEl(null)}
        onGroupChange={handleGroupChange}
        onSortingChange={handleOrderAssignments}
        open={Boolean(filtersAnchorEl)}
        selectedGroup={selectedGroup}
        selectedSorting={selectedSorting}
      />

      {confirmationOpen ? (
        <ConfirmationDialog
          open={confirmationOpen}
          title="Eliminar la tarea?"
          content={
            <>
              Ten en cuenta que esta accion tambien eliminara <br /> todas las
              entregas asociadas.
            </>
          }
          cancelText="Cancelar"
          deleteText="Eliminar"
          onCancel={() => setConfirmationOpen(false)}
          onDelete={handleConfirmDelete}
        />
      ) : null}

      {validationDialogOpen ? (
        <ValidationDialog
          open={validationDialogOpen}
          title="Tarea eliminada exitosamente"
          closeText="Cerrar"
          onClose={() => {
            setValidationDialogOpen(false);
          }}
        />
      ) : null}

      <FeedbackSnackbar
        open={Boolean(feedbackMessage) && !validationDialogOpen}
        message={feedbackMessage}
        severity={feedbackSeverity}
        onClose={() => setFeedbackMessage("")}
      />
    </>
  );
}

export default AssignmentsList;
