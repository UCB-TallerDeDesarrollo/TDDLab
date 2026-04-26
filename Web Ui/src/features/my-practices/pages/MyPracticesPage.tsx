import { useEffect } from "react";
import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
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

  useEffect(() => {
    loadPractices();
  }, [loadPractices]);

  return (
    <FeatureScreenLayout className="Practicas" testId="assignments-container">
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
    </FeatureScreenLayout>
  );
}
