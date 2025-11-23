import "./styles/Login.css"; // Archivo de estilos CSS
import { CheckIfUserHasAccount } from "../../modules/User-Authentication/application/checkIfUserHasAccount";
import { useNavigate } from "react-router-dom";
import { handleSignInWithGitHub } from "../../modules/User-Authentication/application/signInWithGithub";
import { handleSignInWithGoogle } from "../../modules/User-Authentication/application/signInWithGoogle";
import { setCookieAndGlobalStateForValidUser } from "../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import { useEffect } from "react";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";

const Login = () => {
  const navigate = useNavigate();
  const authData = useGlobalState("authData");

  useEffect(() => {
    if (authData[0].userEmail) {
      navigate({
        pathname: "/",
      });
    }
  }, [authData]);
  const handleGitHubLogin = async () => {
    const userData = await handleSignInWithGitHub();
    if (userData?.email) {
      const idToken = await userData.getIdToken();
      const loginPort = new CheckIfUserHasAccount();
      const userCourse = await loginPort.userHasAnAccountWithToken(idToken);
      setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
        navigate({
          pathname: "/",
        }),
      );
      localStorage.setItem("userProfilePic", userData.photoURL||"");
    } else {
      alert("Disculpa, tu usuario no esta registrado");
    }
  };

  const handleGoogleLogin = async () => {
    const userData = await handleSignInWithGoogle();
    if (userData?.email) {
      const idToken = await userData.getIdToken();
      const loginPort = new CheckIfUserHasAccount();
      const userCourse = await loginPort.userHasAnAccountWithGoogleToken(idToken);
      setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
        navigate({
          pathname: "/",
        }),
      );
      localStorage.setItem("userProfilePic", userData.photoURL||"");
    } else {
      alert("Disculpa, tu usuario no esta registrado");
    }
  };

  return (
    <div className="login-container">
      <header className="app-header">
        <h1>TDDLab</h1>
      </header>
      <div className="login-content">
        <p className="login-Title">
          ¡Bienvenido a TDDLab!, usa tu cuenta para acceder:
        </p>
        <div className="login-buttons">
          <button className="github-button" onClick={handleGitHubLogin}>
            Accede con GitHub
          </button>
          <button className="google-button" onClick={handleGoogleLogin}>
            Accede con Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
