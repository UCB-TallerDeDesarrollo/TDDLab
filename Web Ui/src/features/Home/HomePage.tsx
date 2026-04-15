import { useMemo } from "react";
import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import "./styles/HomePage.css";

const HomePage = () => {
  const authData = useGlobalState("authData")[0];

  const displayName = useMemo(() => {
    const email = authData.userEmail?.trim() ?? "";
    if (!email) {
      return "Usuario";
    }

    const localPart = email.split("@")[0] || "Usuario";
    const normalized = localPart
      .replace(/[._-]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");

    return normalized || "Usuario";
  }, [authData.userEmail]);

  return (
    <main className="home-page">
      <section className="home-hero">
        <h1 className="home-title">Hola {displayName}, bienvenido al TDD Lab!!!</h1>

        <div className="home-brand-row">
          <div className="brand-mark-box" aria-hidden="true">
            <div className="brand-mark">
              <span className="diamond diamond-blue top" />
              <span className="diamond diamond-blue right" />
              <span className="diamond diamond-blue bottom" />
              <span className="diamond diamond-blue left" />

              <span className="diamond diamond-green top-left" />
              <span className="diamond diamond-green top-right" />
              <span className="diamond diamond-green bottom-left" />
              <span className="diamond diamond-green bottom-right" />

              <span className="diamond diamond-red center" />
            </div>
          </div>

          <div className="wordmark" aria-label="TDD Lab">
            <span className="wordmark-tdd">TDD</span>
            <span className="wordmark-lab">LAB</span>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
