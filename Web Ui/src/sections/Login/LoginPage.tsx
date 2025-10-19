import "./styles/Login.css"; // Archivo de estilos CSS
import { CheckIfUserHasAccount } from "../../modules/User-Authentication/application/checkIfUserHasAccount";
import { useNavigate } from "react-router-dom";
import { handleSignInWithGitHub } from "../../modules/User-Authentication/application/signInWithGithub";
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
      const loginPort = new CheckIfUserHasAccount();
      const userCourse = await loginPort.userHasAnAccount(userData.email);
      setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
        navigate({
          pathname: "/",
        }),
      );
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
          ¡Bienvenido a TDDLab!, usa tu cuenta de GitHub para acceder:
        </p>
        <button className="github-button" onClick={handleGitHubLogin}>
          Accede con GitHub
        </button>
      </div>
    </div>
  );
};

export default Login;
