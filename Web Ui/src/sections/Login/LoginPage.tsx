import "./styles/Login.css"; 
import { AppBar, Toolbar } from "@mui/material";
import { CheckIfUserHasAccount } from "../../modules/User-Authentication/application/checkIfUserHasAccount";
import { useNavigate } from "react-router-dom";
import { handleSignInWithGitHub } from "../../modules/User-Authentication/application/signInWithGithub";
import { handleSignInWithGoogle } from "../../modules/User-Authentication/application/signInWithGoogle";
import { setCookieAndGlobalStateForValidUser } from "../../modules/User-Authentication/application/setCookieAndGlobalStateForValidUser";
import { useEffect } from "react";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import TDDLabLogo from "../../assets/TDDLabLogo";
import TDDLabLogoDark from "../../assets/TDDLabLogoDark";
import { ActionButton } from "../Shared/Components/ActionButton";

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
      if (userData?.email) {
        const idToken = await userData.getIdToken();
        const loginPort = new CheckIfUserHasAccount();
        const userCourse = await loginPort.userHasAnAccountWithToken(idToken);
        if (userCourse) {
          setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
            navigate({
              pathname: "/",
            }),
          );
          localStorage.setItem("userProfilePic", userData.photoURL || "");
        } else {
          alert("Disculpa, tu usuario no está registrado. Por favor, regístrate primero.");
        }
      } else {
        alert("Disculpa, tu usuario no está registrado. Por favor, regístrate primero.");
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Error al iniciar sesión";
      if (errorMessage.includes("Google")) {
        alert("Este usuario está registrado con Google. Por favor, inicia sesión con Google.");
      } else if (errorMessage.includes("no encontrado") || errorMessage.includes("404")) {
        alert("Usuario no encontrado. Por favor, regístrate primero.");
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userData = await handleSignInWithGoogle();
      if (userData?.email) {
        const idToken = await userData.getIdToken();
        const loginPort = new CheckIfUserHasAccount();
        const userCourse = await loginPort.userHasAnAccountWithGoogleToken(idToken);
        if (userCourse) {
          setCookieAndGlobalStateForValidUser(userData, userCourse, () =>
            navigate({
              pathname: "/",
            }),
          );
          localStorage.setItem("userProfilePic", userData.photoURL || "");
        } else {
          alert("Disculpa, tu usuario no está registrado. Por favor, regístrate primero.");
        }
      } else {
        alert("Disculpa, tu usuario no está registrado. Por favor, regístrate primero.");
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Error al iniciar sesión";
      if (errorMessage.includes("GitHub")) {
        alert("Este usuario está registrado con GitHub. Por favor, inicia sesión con GitHub.");
      } else if (errorMessage.includes("no encontrado") || errorMessage.includes("404")) {
        alert("Usuario no encontrado. Por favor, regístrate primero.");
      } else {
        alert(errorMessage);
      }
    }
  };

  return (
    <>
      <AppBar position="static" className="login-topbar">
        <Toolbar className="login-toolbar">
          <div className="topbar-logo">
            <TDDLabLogo />
          </div>
          <div className="topbar-center-rectangle"></div>
          <div className="topbar-actions">
            <ActionButton
              onClick={handleGitHubLogin}
              className="action-button github"
            >
              Accede con GitHub
            </ActionButton>
            <ActionButton
              onClick={handleGoogleLogin}
              className="action-button google"
            >
              Accede con Google
            </ActionButton>
          </div>
        </Toolbar>
      </AppBar>

      <div className="login-container">
        <main className="hero-section">
          <div className="hero-card">
            <div className="hero-logo">
              <TDDLabLogoDark />
            </div>
            <p className="hero-description">
              TDDLab es una plataforma diseñada para aprender y practicar el desarrollo guiado por pruebas de forma clara, progresiva y aplicada. Convierte la teoría en práctica real, mejora tu lógica, calidad de código y flujo de trabajo con herramientas usadas en entornos profesionales.
            </p>
          </div>
        </main>

        <section className="feature-grid">
          <article className="feature-card">
            <h3>Qué es</h3>
            <p>
              TDDLab es un entorno de aprendizaje práctico donde aplicas Test-Driven Development mediante ejercicios, pruebas automatizadas y control de versiones en proyectos reales.
            </p>
          </article>
          <article className="feature-card">
            <h3>Cómo funciona</h3>
            <p>
              Aprendes resolviendo retos guiados: escribes pruebas, desarrollas código, haces commits y validas resultados siguiendo un flujo de trabajo profesional.
            </p>
          </article>
          <article className="feature-card">
            <h3>Para qué sirve</h3>
            <p>
              Sirve para mejorar tu lógica de programación, escribir código más confiable y dominar metodologías modernas usadas por equipos de desarrollo en la industria.
            </p>
          </article>
        </section>

        <section className="benefits-section">
          <div className="section-header">
            <span className="section-line" />
            <h2>Beneficios</h2>
            <span className="section-line" />
          </div>

          <div className="benefits-slider">
            <article className="benefit-card side-card left-card">
              <div className="benefit-preview" />
            </article>
            <article className="benefit-card main-card">
              <div className="benefit-icon">👥</div>
              <h3>Aprendizaje práctico real</h3>
              <p>
                Desarrolla habilidades aplicadas con ejercicios reales, mejora tu lógica, reduce errores y aprende un flujo profesional desde el inicio.
              </p>
            </article>
            <article className="benefit-card side-card right-card">
              <div className="benefit-preview" />
            </article>
          </div>

          <div className="benefits-dots">
            <span className="dot" />
            <span className="dot active" />
            <span className="dot" />
          </div>
        </section>
      </div>
    </>
  );
};

export default Login;
