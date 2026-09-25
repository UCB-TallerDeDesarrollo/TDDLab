import * as React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import { getAuth } from "firebase/auth";
import PopUp from "./PopUp";
import { useNavigate } from "react-router-dom";
import firebase from "../../../firebaseConfig";
import { fireBaseAuthManager } from "../../../modules/User-Authentication/infraestructure/FirebaseAuthManager";
import { OAuthProvider } from "../../../modules/User-Authentication/domain/AuthManager";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import AuthRepository from "../../../modules/User-Authentication/repository/LoginRepository";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";

const checkIfUserHasAccount = new CheckIfUserHasAccount(new AuthRepository());

function CheckRegisterGroupPopUp() {
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  const handleClose = async () => {
    setOpen(false);

    try {
      await fireBaseAuthManager.login(OAuthProvider.Google);

      const auth = getAuth(firebase);
      const currentUser = auth.currentUser;

      if (!currentUser?.email) {
        alert("Disculpa, tu usuario no esta registrado");
        return;
      }

      const idToken = await currentUser.getIdToken();
      const userCourse = await checkIfUserHasAccount.execute(idToken, OAuthProvider.Google);

      if (!userCourse) {
        alert("Disculpa, tu usuario no esta registrado");
        return;
      }

      setCookieAndGlobalStateForValidUser(currentUser, userCourse, () =>
        navigate({
          pathname: "/",
        }),
      );
    } catch (error) {
      alert("Disculpa, tu usuario no esta registrado");
    }
  };

  const dialogContent: any = (
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
