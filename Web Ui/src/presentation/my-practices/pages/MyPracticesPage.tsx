import { useEffect, useState } from "react";
import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
import FeedbackSnackbar from "../../../shared/components/FeedbackSnackbar";
import { useSnackbarFeedback } from "../../../shared/hooks/useSnackbarFeedback";
import { addPracticeCreatedListener } from "../services/practiceEvents";
import MyPracticesForm from "../components/MyPracticesForm";
import MyPracticesList from "../components/MyPracticesList";
import { useMyPracticesScreen } from "../hooks/useMyPracticesScreen";

interface PracticeManagerProps {
  userRole: string;
  userid: number;
}

export default function MyPracticesPage({
  userRole,
  userid,
}: Readonly<PracticeManagerProps>) {
  const {
    practiceItems,
    selectedSorting,
    isSaving,
    error,
    viewState,
    canManagePractices,
    canCreatePractices,
    isCreateFormOpen,
    loadPractices,
    changeSorting,
    openCreateForm,
    closeCreateForm,
    openPracticeDetail,
    createPractice,
    deletePractice,
    updatePractice,
  } = useMyPracticesScreen(userid, userRole);

  const title = "Mis practicas";
  document.title = title;
  const { snackbar, showSuccess, handleClose: handleSnackbarClose } = useSnackbarFeedback();

  useEffect(() => {
    loadPractices();
  }, [loadPractices]);

  useEffect(() => {
    return addPracticeCreatedListener(() => {
      showSuccess("Practica creada exitosamente");
    });
  }, [showSuccess]);

  return (
    <FeatureScreenLayout
      className="practices-page"
      testId="assignments-container"
      sectionGap={0}
    >
      <MyPracticesList
        onShowForm={openCreateForm}
        practices={practiceItems}
        selectedSorting={selectedSorting}
        isSaving={isSaving}
        viewState={viewState}
        error={error}
        canManagePractices={canManagePractices}
        canCreatePractices={canCreatePractices}
        onSortChange={changeSorting}
        onOpenDetail={openPracticeDetail}
        onDeletePractice={deletePractice}
        onPracticeUpdated={updatePractice}
      />
      {isCreateFormOpen ? (
        <MyPracticesForm
          data-testid="form-container"
          open={isCreateFormOpen}
          handleClose={closeCreateForm}
          userid={userid}
          isSaving={isSaving}
          onCreate={createPractice}
        />
      ) : null}

      <FeedbackSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </FeatureScreenLayout>
  );
}
