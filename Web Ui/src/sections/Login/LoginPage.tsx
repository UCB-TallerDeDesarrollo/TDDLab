import "./styles/Login.css"; // Archivo de estilos CSS
import { CheckIfUserHasAccount } from "../../modules/Auth/application/checkIfUserHasAccount";
import { setGlobalState } from "../../modules/Auth/domain/authStates";
import { useNavigate } from "react-router-dom";
import { handleSignInWithGitHub } from "../../modules/Auth/application/signInWithGithub";

const Login = () => {
  const navigate = useNavigate();

  const handleGitHubLogin = async () => {
    let userData = await handleSignInWithGitHub();
    if (userData?.email) {
      const loginPort = new CheckIfUserHasAccount();
      let userCourse = await loginPort.userHasAnAcount(userData.email);
      if (userCourse && userData.photoURL) {
        setGlobalState("authData", {
          userProfilePic: userData.photoURL,
          userEmail: userData.email,
          userCourse: userCourse,
        });
        navigate({
          pathname: "/",
        });
      } else {
        console.log("Invalid User");
      }
    } else {
      alert("tu usuario no esta registrado");
    }
  };

  return (
    <div className="login-container">
      <header className="app-header">
        <h1>TDDLab</h1>
      </header>
      <div className="login-content">
        <p className="login-Title">
          Welcome to TDDLab! Please login using GitHub:
        </p>
        <button className="github-button" onClick={handleGitHubLogin}>
          Login with GitHub
        </button>
      </div>
    </div>
  );
};

export default Login;
