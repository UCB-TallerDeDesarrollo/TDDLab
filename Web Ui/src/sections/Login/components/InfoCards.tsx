import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import LightbulbIcon from '@mui/icons-material/Lightbulb'; // Importamos el de la bombilla

export const InfoCards = () => (
  <section className="info-cards-container">
    <div className="info-card">
      <div className="icon-box">
        <HelpOutlineIcon className="card-icon-svg" />
      </div>
      <h3>¿Qué es?</h3>
      <p>TDDLab es un entorno educativo interactivo especializado en la enseñanza y práctica de TDD.</p>
    </div>

    <div className="info-card">
      <div className="icon-box">
        <SettingsInputComponentIcon className="card-icon-svg" />
      </div>
      <h3>¿Como funciona?</h3>
      <p>A través de visualizaciones en tiempo real, puedes observar cómo evoluciona tu código a medida que superas cada prueba unitaria.</p>
    </div>

    <div className="info-card">
      <div className="icon-box">
        <LightbulbIcon className="card-icon-svg" />
      </div>
      <h3>¿Para que sirve?</h3>
      <p>Sirve para reducir drásticamente el número de errores en producción y mejorar la mantenibilidad de tus proyectos.</p>
    </div>
  </section>
);