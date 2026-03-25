import Practices from "./MyPracticesList";
import { useState } from "react";
import MyPracticesForm from "./MyPracticesForm";
import "../../App.css";

interface PracticeManagerProps {
  userRole: string;
  userid: number;
}
function PracticeManager({ userRole, userid }: Readonly<PracticeManagerProps>) {
  const [createAssignmentPopupOpen, setCreateAssignmentPopupOpen] =
    useState(false);

  return (
    <div className="centered-container">
      <div className="table-container-full">
        <Practices 
          ShowForm={() => setCreateAssignmentPopupOpen(true)} 
          userRole={userRole} 
        />
      </div>
      
      {createAssignmentPopupOpen && (
        <MyPracticesForm
          open={createAssignmentPopupOpen}
          handleClose={() => setCreateAssignmentPopupOpen(false)}
          userid={userid}
        />
      )}
    </div>
  );
}

export default PracticeManager;