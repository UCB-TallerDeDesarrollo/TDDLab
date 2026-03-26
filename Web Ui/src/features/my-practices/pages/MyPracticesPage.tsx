import { useEffect } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import MyPracticesForm from "../components/MyPracticesForm";
import MyPracticesList from "../components/MyPracticesList";
import { useMyPracticesScreen } from "../hooks/useMyPracticesScreen";

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
    <PageContainer>
      <ScreenSection data-testid="assignments-container">
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
      </ScreenSection>
    </PageContainer>
  );
}
