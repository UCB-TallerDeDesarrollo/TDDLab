import Practices from "./MyPracticesList";
import { styled } from "@mui/system";
import { useEffect, useState } from "react";
import MyPracticesForm from "./MyPracticesForm";
import { useMyPractices } from "./hooks/useMyPractices";
const PrcticesContainer = styled("div")({
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
function PracticeManager({ userRole, userid }: Readonly<PracticeManagerProps>) {
  const [createAssignmentPopupOpen, setCreateAssignmentPopupOpen] =
    useState(false);
  const {
    practices,
    selectedSorting,
    isSaving,
    error,
    viewState,
    canManagePractices,
    canCreatePractices,
    loadPractices,
    changeSorting,
    createPractice,
    deletePractice,
    updatePractice,
  } = useMyPractices(userid, userRole);

  useEffect(() => {
    loadPractices();
  }, [loadPractices]);

  const handleCreateAssignmentClick = () => {
    setCreateAssignmentPopupOpen(true);
  };

  return (
    <>
      <PrcticesContainer data-testid="assignments-container">
        <Practices
          ShowForm={handleCreateAssignmentClick}
          practices={practices}
          selectedSorting={selectedSorting}
          isSaving={isSaving}
          viewState={viewState}
          error={error}
          canManagePractices={canManagePractices}
          canCreatePractices={canCreatePractices}
          onRetry={loadPractices}
          onSortChange={changeSorting}
          onDeletePractice={deletePractice}
          onPracticeUpdated={updatePractice}
        />
      </PrcticesContainer>
      <FormsContainer>
        {createAssignmentPopupOpen && (
          <MyPracticesForm
            data-testid="form-container"
            open={createAssignmentPopupOpen}
            handleClose={() => setCreateAssignmentPopupOpen(false)}
            userid={userid}
            isSaving={isSaving}
            onCreate={async (input) => {
              await createPractice(input);
            }}
          />
        )}
      </FormsContainer>
    </>
  );
}

export default PracticeManager;
