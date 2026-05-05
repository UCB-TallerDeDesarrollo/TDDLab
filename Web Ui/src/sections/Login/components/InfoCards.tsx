import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';


export const InfoCards = () => (
  <section className="info-cards-container">
    <div className="info-card">
      <HelpOutlineIcon className="card-icon" />
      <h3>¿Qué es?</h3>
      <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime...</p>
    </div>
    <div className="info-card">
      <SettingsInputComponentIcon className="card-icon" />
      <h3>¿Como funciona?</h3>
      <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime...</p>
    </div>
    <div className="info-card">
     
      <h3>¿Para que sirve?</h3>
      <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime...</p>
    </div>
  </section>
);