import { Button } from "@mui/material";
import { GithubAuthPort } from "../../../modules/Auth/application/GithubAuthPort";
import { LoginPort } from "../../../modules/Auth/application/LoginPort";

export default function loginComponent() {
  const handleLogin = async () => {
    const githbAuthPort = new GithubAuthPort();
    let userData = await githbAuthPort.handleSignInWithGitHub();
    if (userData?.email) {
      const loginPort = new LoginPort();
      let userCourse = await loginPort.userHasAnAcount(userData.email);
      if (userCourse) {
        console.log("Valid User");
      } else {
        console.log("Invalid User");
      }
    }
  };

  return (
    <Button
      onClick={handleLogin}
      variant="contained"
      sx={{ marginLeft: "18px" }}
    >
      Iniciar sesión
    </Button>
  );
}
