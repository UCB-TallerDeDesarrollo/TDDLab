import Practices from "./MyPracticesList";
import { styled } from "@mui/system";
import { useState } from "react";
import MyPracticesForm from "./MyPracticesForm";
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

  const handleCreateAssignmentClick = () => {
    setCreateAssignmentPopupOpen(true);
  };

  return (
    <>
      <PrcticesContainer data-testid="assignments-container">
        <Practices ShowForm={handleCreateAssignmentClick} userRole={userRole} />
      </PrcticesContainer>
      <FormsContainer>
        {createAssignmentPopupOpen && (
          <MyPracticesForm
            data-testid="form-container"
            open={createAssignmentPopupOpen}
            handleClose={() => setCreateAssignmentPopupOpen(false)}
            userid={userid}
          />
        )}
      </FormsContainer>
    </>
  );
}

export default PracticeManager;
