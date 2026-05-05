import { Box, Typography, Stack, Link } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import logoTddLab from "../../../assets/logo-tddlab.svg";

export const LandingFooter = () => {
  return (
    <Box component="footer" className="landing-footer">
      <Box className="footer-content">
        {/* Logo */}
        <Box className="footer-brand">
          <img src={logoTddLab} alt="TDDLab" className="footer-logo" />
        </Box>

        {/* Info de contacto */}
        <Box className="footer-info">
          <Typography variant="body2">Email: contact@tddlab.com</Typography>
          <Typography variant="body2">Teléfono: +1 (123) 456-7890</Typography>
        </Box>

        {/* Links Legales */}
        <Box className="footer-links">
          <Link href="#">Política de Privacidad</Link>
          <Link href="#">Términos y Condiciones</Link>
          <Link href="#">Política de Cookies</Link>
        </Box>

        {/* Social */}
        <Box className="footer-social">
          <Typography variant="subtitle2">Conecta con nosotros</Typography>
          <Stack direction="row" spacing={1} className="social-icons">
            <FacebookIcon />
            <GitHubIcon />
            <YouTubeIcon />
            <InstagramIcon />
          </Stack>
        </Box>
      </Box>
      
      <Typography variant="caption" className="copyright">
        © 2025 TDDLab. Todos los derechos reservados.
      </Typography>
    </Box>
  );
};