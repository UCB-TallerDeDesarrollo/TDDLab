import Practices from "./MyPracticesList";
import { useState } from "react";
import MyPracticesForm from "./MyPracticesForm";
import "../../App.css";

interface PracticeManagerProps {
  userRole: string;
  userid: number;
}

function PracticeManager({ userRole, userid }: Readonly<PracticeManagerProps>) {
  const [createAssignmentPopupOpen, setCreateAssignmentPopupOpen] = useState(false);

  return (
    <>
      <Practices
        ShowForm={() => setCreateAssignmentPopupOpen(true)}
        userRole={userRole}
      />

      {createAssignmentPopupOpen && (
        <MyPracticesForm
          open={createAssignmentPopupOpen}
          handleClose={() => setCreateAssignmentPopupOpen(false)}
          userid={userid}
        />
      )}
    </>
  );
}

export default PracticeManager;
