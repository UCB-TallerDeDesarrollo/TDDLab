import { Button } from "@mui/material";
import logoTddLab from "../../../assets/logo-tddlab.svg";

interface Props { onLoginClick: () => void; }

export const HeroSection = ({ onLoginClick }: Props) => (
  <header className="hero-section">
    <div className="hero-content">
      <img src={logoTddLab} alt="TDDLab Logo" className="hero-logo" />
      <p className="hero-description">
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <Button className="btn-primary hero-btn" onClick={onLoginClick}>
        Ir a TDD Lab
      </Button>
    </div>
  </header>
);