import { styled } from "@mui/system";
import { useEffect } from "react";
import MyPracticesForm from "../../../sections/MyPractices/MyPracticesForm";
import MyPracticesList from "../components/MyPracticesList";
import { useMyPracticesScreen } from "../hooks/useMyPracticesScreen";

const PracticesContainer = styled("div")({
  justifyContent: "center",
  alignItems: "center",
});

const FormsContainer = styled("div")({
  flex: "1",
  marginLeft: "8px",
  marginRight: "2px",
  marginTop: "68px",
});

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
    <>
      <PracticesContainer data-testid="assignments-container">
        <MyPracticesList
          onShowForm={openCreateForm}
          practices={practiceItems}
          selectedSorting={selectedSorting}
          isSaving={isSaving}
          viewState={viewState}
          error={error}
          canManagePractices={canManagePractices}
          canCreatePractices={canCreatePractices}
          onRetry={loadPractices}
          onSortChange={changeSorting}
          onOpenDetail={openPracticeDetail}
          onDeletePractice={deletePractice}
          onPracticeUpdated={updatePractice}
        />
      </PracticesContainer>
      <FormsContainer>
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
      </FormsContainer>
    </>
  );
}
