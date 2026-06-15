const FooterSection = () => {
  return (
    <footer className="landing-footer" aria-label="Pie de pagina">
      <div className="landing-container landing-footer-content">
        <img src="/landing/logo.svg" alt="Logo TDDLab" className="landing-footer-logo" />

        <div className="landing-footer-links">
          <p>Politica de Privacidad</p>
          <p>Terminos y Condiciones</p>
          <p>Politica de Cookies</p>
        </div>

        <p className="landing-footer-copyright">© 2026 TDDLab. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default FooterSection;
