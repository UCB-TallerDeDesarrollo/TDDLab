import Form from "./components/AssignmentForm";
import Assignments from "./components/AssignmentsList";
import { useState } from "react";

interface AssignmentManagerProps {
  userRole: string;
  userGroupid: number;
}

function AssignmentManager({
  userRole,
  userGroupid,
}: Readonly<AssignmentManagerProps>) {
  const [createAssignmentPopupOpen, setCreateAssignmentPopupOpen] =
    useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleCreateAssignmentClick = () => {
    setCreateAssignmentPopupOpen(true);
  };

  return (
    <>
      <Assignments
        ShowForm={handleCreateAssignmentClick}
        userRole={userRole}
        userGroupid={userGroupid}
        onGroupChange={setSelectedGroupId}
      />

      {createAssignmentPopupOpen && (
        <Form
          data-testid="form-container"
          open={createAssignmentPopupOpen}
          handleClose={() => setCreateAssignmentPopupOpen(false)}
          groupid={
            selectedGroupId ??
            (Number(localStorage.getItem("selectedGroup") ?? NaN) || userGroupid)
          }
        />
      )}
    </>
  );
}

export default AssignmentManager;