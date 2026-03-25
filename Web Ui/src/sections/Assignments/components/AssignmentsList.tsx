import { useState } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import { ConfirmationDialog } from "../../Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../../Shared/Components/ValidationDialog";
import { AssignmentListProps } from "../../../features/assignments/types/assignmentScreen";
import { useAssignmentsScreen } from "../../../features/assignments/hooks/useAssignmentsScreen";
import AssignmentsFilterPopover from "../../../features/assignments/components/AssignmentsFilterPopover";
import AssignmentsListLayout from "../../../features/assignments/components/AssignmentsListLayout";
import ActionButton from "../../../shared/components/ActionButton";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";
import FeatureSectionDivider from "../../../shared/components/FeatureSectionDivider";
import Assignment from "./Assignment";

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(7.5),
  paddingBottom: theme.spacing(5),
}));

const ScreenSection = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 1301,
  marginInline: "auto",
  display: "grid",
  gap: theme.spacing(4.25),
}));

const LoadingContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
});

const ListHeader = styled(Typography)({
  color: "#002346",
  fontSize: 24,
  fontWeight: 700,
  lineHeight: "29px",
});

const ListSection = styled(Box)(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2.5),
}));

function Assignments({
  ShowForm: showForm,
  userRole,
  userGroupid,
  onGroupChange,
}: Readonly<AssignmentListProps>) {
  const {
    assignments,
    confirmationOpen,
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

  const handleRowHover = (_index: number | null) => {};

  return (
    <PageContainer>
      {isLoading ? (
        <LoadingContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              width: "100vw",
            }}
          >
            <CircularProgress />
          </div>
        </LoadingContainer>
      ) : (
        <ScreenSection className="Tareas">
          <FeaturePageHeader
            title="Tareas"
            actions={
              <>
                <ActionButton
                  startIcon={<FilterListRoundedIcon />}
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

          <ListSection>
            <ListHeader>Listado</ListHeader>
            <AssignmentsListLayout>
              {assignments.map((assignment, index) => (
                <Assignment
                  key={assignment.id}
                  assignment={assignment}
                  index={index}
                  handleClickDetail={handleClickDetail}
                  handleClickDelete={handleClickDelete}
                  handleRowHover={handleRowHover}
                  role={userRole}
                />
              ))}
            </AssignmentsListLayout>
          </ListSection>

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
              title="¿Eliminar la tarea?"
              content={
                <>
                  Ten en cuenta que esta acción también eliminará <br /> todas las
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
        </ScreenSection>
      )}
    </PageContainer>
  );
}

export default Assignments;
