import "./styles/Login.css";
import { CheckIfUserHasAccount } from "../../modules/User-Authentication/application/checkIfUserHasAccount";
import { useNavigate } from "react-router-dom";
import { handleSignInWithGitHub } from "../../modules/User-Authentication/application/signInWithGithub";
import { setCookieAndGlobalStateForValidUser } from "../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import { useEffect } from "react";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import AuthRepository from "../../modules/User-Authentication/repository/LoginRepository";
import { UserOnDb } from "../../modules/User-Authentication/domain/userOnDb.interface";

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
    try {
      const userData = await handleSignInWithGitHub();
      
      if (!userData?.email) {
        alert("Error al iniciar sesión con GitHub. Por favor intenta nuevamente.");
        return;
      }

      const loginPort = new CheckIfUserHasAccount();
      let userCourse = await loginPort.userHasAnAccount(userData.email);

      // Si el usuario no existe, registrarlo automáticamente
      if (!userCourse) {
        console.log("Usuario no encontrado. Registrando nuevo usuario...");
        
        const authRepository = new AuthRepository();
        const newUser: UserOnDb = {
          email: userData.email,
          groupid: 0, // Sin grupo asignado inicialmente
          role: "student", // Rol por defecto
        };

        await authRepository.registerAccount(newUser);
        console.log("Usuario registrado exitosamente");

        // Verificar nuevamente después de registrar
        userCourse = await loginPort.userHasAnAccount(userData.email);
      }

      setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
        navigate({
          pathname: "/",
        }),
      );
    } catch (error) {
      console.error("Error durante el login:", error);
      alert("Ocurrió un error durante el inicio de sesión. Por favor intenta nuevamente.");
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