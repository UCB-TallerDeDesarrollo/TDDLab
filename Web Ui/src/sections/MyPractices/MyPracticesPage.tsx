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
  const [refreshToken, setRefreshToken] = useState(0);

  const handleCreateAssignmentClick = () => {
    setCreateAssignmentPopupOpen(true);
  };

  const refreshPractices = () => {
    setRefreshToken((prev) => prev + 1);
  };

  return (
    <>
      <PrcticesContainer data-testid="assignments-container">
        <Practices
          ShowForm={handleCreateAssignmentClick}
          userRole={userRole}
          refreshToken={refreshToken}
        />
      </PrcticesContainer>
      <FormsContainer>
        {createAssignmentPopupOpen && (
          <MyPracticesForm
            data-testid="form-container"
            open={createAssignmentPopupOpen}
            handleClose={() => setCreateAssignmentPopupOpen(false)}
            userid={userid}
            onCreated={refreshPractices}
          />
        )}
      </FormsContainer>
    </>
  );
}

export default PracticeManager;
