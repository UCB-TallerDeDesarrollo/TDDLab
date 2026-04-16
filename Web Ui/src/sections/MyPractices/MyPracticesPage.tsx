import Practices from "./MyPracticesList";
import { useState } from "react";
import MyPracticesForm from "./MyPracticesForm";
import { PrcticesContainer, FormsContainer } from "./StyledComponents";


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
