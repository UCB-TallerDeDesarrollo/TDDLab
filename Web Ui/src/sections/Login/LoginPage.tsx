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
import bancoImage from "../../assets/BancoIMG.png";
import beneficio1Image from "../../assets/Beneficio1.png";
import beneficio2Image from "../../assets/Beneficio2.png";
import beneficio3Image from "../../assets/Beneficio3.png";
import focoImage from "../../assets/Foco.png";
import barrasImage from "../../assets/Barras.png";
import interrogacionImage from "../../assets/Interrogacion.png";
import { ActionButton } from "../Shared/Components/ActionButton";
import isotipoTDD from "../../assets/isotipotdd.png";

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
            <div className="feature-icon feature-icon-question">
              <img src={interrogacionImage} alt="Interrogación" />
            </div>
            <h3>Qué es</h3>
            <p>
              TDDLab es un entorno de aprendizaje práctico donde aplicas Test-Driven Development mediante ejercicios, pruebas automatizadas y control de versiones en proyectos reales.
            </p>
          </article>
          <article className="feature-card">
            <div className="feature-icon feature-icon-bars">
              <img src={barrasImage} alt="Barras" />
            </div>
            <h3>Cómo funciona</h3>
            <p>
              Aprendes resolviendo retos guiados: escribes pruebas, desarrollas código, haces commits y validas resultados siguiendo un flujo de trabajo profesional.
            </p>
          </article>
          <article className="feature-card focus-card">
            <div className="feature-icon feature-icon-focus">
              <img src={focoImage} alt="Foco" />
            </div>
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
        
          <article
            className="benefit-card main-card side-card"
            style={{ backgroundImage: `url(${beneficio2Image})` }}
          >
            <h3>Código más confiable</h3>
            <p>Reduce errores y asegura que tu software funcione como esperas.</p>
          </article>


          <article
            className="benefit-card main-card"
            style={{ backgroundImage: `url(${beneficio1Image})` }}
          >

            <h3>Aprendizaje práctico real</h3>
            <p>
              Desarrolla habilidades aplicadas con ejercicios reales y aprende un flujo profesional.
            </p>
          </article>


          <article
            className="benefit-card main-card side-card"
            style={{ backgroundImage: `url(${beneficio3Image})` }}
          >
            <h3>Flujo Profesional</h3>
            <p>Domina Git, commits y pruebas automatizadas desde el primer día.</p>
          </article>
        </div>


      </section>

        <section className="resources-section">
          <div className="section-header">
            <span className="section-line" />
            <h2>Recursos</h2>
            <span className="section-line" />
          </div>

          <div className="resources-grid resources-grid-two-col">
            <div className="resources-column left-column">
              <article className="resource-card large-image-card">
                <img src={bancoImage} alt="Banco de imágenes" className="resource-image" />
              </article>
            </div>

            <div className="resources-column right-column">
              <article className="resource-card text-card">
                <h3>Guías</h3>
                <p>
                  Accede a guías estructuradas que explican paso a paso cómo aplicar Test-Driven Development, desde conceptos básicos hasta flujos avanzados.
                </p>
                <p>
                  Diseñadas para acompañarte en cada etapa, facilitando la comprensión técnica sin perder el enfoque práctico necesario para programar con confianza.
                </p>
              </article>
              <article className="resource-card text-card">
                <h3>Tutoriales</h3>
                <p>
                  Explora tutoriales dinámicos que te muestran cómo resolver ejercicios reales utilizando TDD. Aprende viendo procesos completos.
                </p>
                <p>
                  Desde la creación de pruebas hasta la implementación final, entiende no solo el resultado, sino también la lógica detrás de cada decisión.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="integration-section">
          <div className="section-header">
            <span className="section-line" />
            <h2>Integración</h2>
            <span className="section-line" />
          </div>

          <div className="integration-grid">
            <article className="integration-card card-left">
              <div className="integration-logo integration-logo-vscode">VS</div>
              <h3>Visual Studio Code</h3>
              <p>
                Trabaja directamente desde Visual Studio Code integrando TDDLab a tu entorno habitual, facilitando la ejecución de pruebas, gestión de código y seguimiento continuo sin salir de tu flujo.
              </p>
            </article>

            <article className="integration-card card-right">
              <div className="integration-logo integration-logo-tddlab">
                <img src={isotipoTDD} alt="TDD Isotipo" className="isotipo-integration" />
              </div>
              <h3>TDDLab</h3>
              <p>
                TDDLab centraliza tus ejercicios, progreso y validaciones en un solo lugar, permitiéndote practicar, medir tu evolución y mantener un control claro de tu aprendizaje.
              </p>
            </article>
          </div>
        </section>

        <section className="ideal-section">
          <div className="ideal-intro">
            <div className="ideal-logo">
              <TDDLabLogoDark />
            </div>
            <h2>Ideal para...</h2>
            <p>
              Ideal para quienes quieren aprender desarrollo de forma estructurada, práctica y alineada con la industria, construyendo habilidades reales desde etapas tempranas de formación.
            </p>
          </div>

          <div className="ideal-grid">
            <article className="ideal-card">
              <div className="ideal-card-image image-1" />
              <div className="ideal-card-content">
                <h3>Desarrolladores en formación</h3>
                <p>Perfecto para estudiantes que buscan aprender programación con bases sólidas, desarrollar lógica, disciplina y buenas prácticas desde el inicio.</p>
                <span className="ideal-bullet bullet-pink" />
              </div>
            </article>
            <article className="ideal-card">
              <div className="ideal-card-image image-2" />
              <div className="ideal-card-content">
                <h3>Programadores profesionales</h3>
                <p>Útil para profesionales que desean mejorar la calidad de su código, optimizar procesos y adoptar metodologías modernas en su flujo de trabajo.</p>
                <span className="ideal-bullet bullet-blue" />
              </div>
            </article>
            <article className="ideal-card">
              <div className="ideal-card-image image-3" />
              <div className="ideal-card-content">
                <h3>Mentores o formadores</h3>
                <p>Herramienta ideal para enseñar programación de forma estructurada, guiando procesos reales y facilitando el seguimiento del progreso de los estudiantes.</p>
                <span className="ideal-bullet bullet-green" />
              </div>
            </article>
          </div>
        </section>



        <footer className="footer-section">
          <div className="footer-logo">
            <TDDLabLogo />
          </div>
          
          <div className="footer-copyright">
            <p>© 2025 TDDLab. Todos los derechos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Login;
