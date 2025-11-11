import * as React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import PopUp from "./PopUp";
import { useNavigate } from "react-router-dom";
import { handleSignInWithGitHub } from "../../../modules/User-Authentication/application/signInWithGithub";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import type { User } from "firebase/auth";

function CheckRegisterGroupPopUp() {
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  const isFirebaseUser = (data: unknown): data is User => {
    return (
      !!data &&
      typeof data === "object" &&
      "email" in (data as Record<string, unknown>) &&
      "getIdToken" in (data as Record<string, unknown>)
    );
  };

  const handleClose = async () => {
    setOpen(false);
    const userData = await handleSignInWithGitHub();
    if (
      userData &&
      (userData as { needsReauth?: string }).needsReauth === "google"
    ) {
      return;
    }
    if (isFirebaseUser(userData)) {
      const idToken = await userData.getIdToken();
      const loginPort = new CheckIfUserHasAccount();
      const userCourse = await loginPort.userHasAnAccountWithToken(idToken);
      setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
        navigate({
          pathname: "/",
        }),
      );
    } else {
        alert(
          "Tu cuenta de GitHub/Google todavía no está registrada en TDDLab. Completa tu invitación o solicita acceso a un administrador."
        );
    }
  };

  const dialogContent: React.ReactNode = (
    <DialogContentText>
        Ya estas registrado en este grupo.
    </DialogContentText>
  );

  return (
    <div>
      <PopUp
        handleClose={handleClose}
        open={open}
        dialogTitle="Vaya"
        dialogContent={dialogContent}
      ></PopUp>
    </div>
  );
}

export default CheckRegisterGroupPopUp;