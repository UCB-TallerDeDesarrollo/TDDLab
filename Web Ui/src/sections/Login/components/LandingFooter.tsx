import { Box, Typography, Stack, Link } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import logoTddLab from "../../../assets/logo-tddlab.svg";

export const LandingFooter = () => {
  return (
    <Box component="footer" className="landing-footer">
      <Box className="footer-container">
        
        {/* Columna 1: Logo */}
        <Box className="footer-column brand">
          <img src={logoTddLab} alt="TDDLab" className="footer-logo" />
        </Box>

        {/* Columna 2: Contacto */}
        <Box className="footer-column contact">
          <Typography className="footer-text">Email: contact@tddlab.com</Typography>
          <Typography className="footer-text">Teléfono: +1 (123) 456-7890</Typography>
        </Box>

        {/* Columna 3: Legal */}
        <Box className="footer-column legal">
          <Link href="#" className="footer-link">Política de Privacidad</Link>
          <Link href="#" className="footer-link">Términos y Condiciones</Link>
          <Link href="#" className="footer-link">Política de Cookies</Link>
        </Box>

        {/* Columna 4: Social */}
        <Box className="footer-column social">
          <Typography className="social-title">Conecta con nosotros</Typography>
          <Stack direction="row" spacing={2} className="social-icons">
            <FacebookIcon />
            <GitHubIcon />
            <YouTubeIcon />
            <InstagramIcon />
          </Stack>
        </Box>

      </Box>
      
      <Box className="footer-bottom">
        <Typography variant="caption" className="copyright">
          © 2025 TDDLab. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
};