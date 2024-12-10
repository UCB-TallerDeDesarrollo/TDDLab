import Form from "../Assignments/components/AssignmentForm";
import Practices from "./MyPracticesList";
import { styled } from "@mui/system";
import { useState } from "react";

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

interface AssignmentManagerProps {
  userRole: string;
  userGroupid: number;
}
function AssignmentManager({
  userRole,
  userGroupid, // Recibir userGroupid como prop
}: Readonly<AssignmentManagerProps>) {
  const [createAssignmentPopupOpen, setCreateAssignmentPopupOpen] =
    useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleCreateAssignmentClick = () => {
    setCreateAssignmentPopupOpen(true);
  };

  return (
    <>
      <PrcticesContainer data-testid="assignments-container">
        <Practices
          ShowForm={handleCreateAssignmentClick}
          userRole={userRole}
          userGroupid={userGroupid}
          onGroupChange={setSelectedGroupId}
        />
      </PrcticesContainer>
      <FormsContainer>
        {createAssignmentPopupOpen && (
          <Form
            data-testid="form-container"
            open={createAssignmentPopupOpen}
            handleClose={() => setCreateAssignmentPopupOpen(false)}
            groupid={selectedGroupId || userGroupid}
          />
        )}
      </FormsContainer>
    </>
  );
}

export default AssignmentManager;
