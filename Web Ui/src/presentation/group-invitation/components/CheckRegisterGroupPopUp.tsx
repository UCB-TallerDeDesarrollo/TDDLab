import * as React from "react";
import DialogContentText from "@mui/material/DialogContentText";
import PopUp from "./PopUp";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import firebase from "../../../firebaseConfig";
import { CheckIfUserHasAccount } from "../../../modules/User-Authentication/application/checkIfUserHasAccount";
import { setCookieAndGlobalStateForValidUser } from "../../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";

function CheckRegisterGroupPopUp() {
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  const handleClose = async () => {
    setOpen(false);
    const userData = getAuth(firebase).currentUser;

    if (userData?.email) {
      const idToken = await userData.getIdToken();
      const loginPort = new CheckIfUserHasAccount();
      const userCourse = await loginPort.userHasAnAccountWithGoogleToken(idToken);
      setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
        navigate({
          pathname: "/",
        }),
      );
    } else {
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
