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
    if (userData && (userData as { needsReauth?: string }).needsReauth) {
      // Se pidió iniciar sesión con Google para completar la vinculación.
      return;
    }
    if (userData?.email) {
      const idToken = await userData.getIdToken();
      console.log("ID Token:", idToken);
      const loginPort = new CheckIfUserHasAccount();
      const userCourse = await loginPort.userHasAnAccountWithToken(idToken);
      setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
        navigate({
          pathname: "/",
        }),
      );
      localStorage.setItem("userProfilePic", userData.photoURL||"");
    } else {
      alert(
        "Tu cuenta de GitHub/Google todavía no está registrada en TDDLab. Completa tu invitación o solicita acceso a un administrador."
      );
    }
  };

  const handleGoogleLogin = async () => {
    const userData = await handleSignInWithGoogle();
    if (userData && (userData as { needsReauth?: string }).needsReauth) {
      // Se pidió iniciar sesión con GitHub para completar la vinculación.
      return;
    }
    if (userData?.email) {
      const idToken = await userData.getIdToken();
      console.log("Google ID Token:", idToken);
      const loginPort = new CheckIfUserHasAccount();
      const userCourse = await loginPort.userHasAnAccountWithGoogleToken(idToken);
      setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
        navigate({
          pathname: "/",
        }),
      );
      localStorage.setItem("userProfilePic", userData.photoURL||"");
    } else {
      alert(
        "Tu cuenta de GitHub/Google todavía no está registrada en TDDLab. Completa tu invitación o solicita acceso a un administrador."
      );
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
