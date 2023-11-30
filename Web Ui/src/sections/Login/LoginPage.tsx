import "./styles/Login.css"; // Archivo de estilos CSS
import { CheckIfUserHasAccount } from "../../modules/Auth/application/checkIfUserHasAccount";
import { setGlobalState } from "../../modules/Auth/domain/authStates";
import { useNavigate } from "react-router-dom";
import { handleSignInWithGitHub } from "../../modules/Auth/application/signInWithGithub";
import { setSessionCookie } from "../../modules/Auth/application/setSessionCookie";
import { setCookieAndGlobalStateForValidUser } from "../../modules/Auth/application/setCookieAndGlobalStateForValidUser";

const Login = () => {
  const navigate = useNavigate();

  const handleGitHubLogin = async () => {
    let userData = await handleSignInWithGitHub();
    if (userData?.email) {
      const loginPort = new CheckIfUserHasAccount();
      let userCourse = await loginPort.userHasAnAcount(userData.email);
      setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
        navigate({
          pathname: "/",
        })
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
