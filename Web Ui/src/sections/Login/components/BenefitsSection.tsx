import { Box, Typography } from "@mui/material";

export const BenefitsSection = () => {
  return (
    <Box className="benefits-section">
      <Typography variant="h2" className="section-title">Recursos y beneficios</Typography>

      <div className="standard-row">
        <div className="text-block">
          <Typography variant="h4">Guías</Typography>
          <Typography variant="body1">Accede a documentación detallada sobre los fundamentos del testing. Desde conceptos básicos hasta patrones avanzados de diseño de pruebas, nuestras guías están diseñadas para acompañarte en cada etapa de tu crecimiento profesional.</Typography>
        </div>
        <div className="img-block-small placeholder-img-guides"></div>
      </div>

      <div className="standard-row">
        <div className="text-block">
          <Typography variant="h4">Tutoriales</Typography>
          <Typography variant="body1">Aprende mediante la práctica con nuestros módulos interactivos. Sigue retos de código que simulan problemas reales de la industria, permitiéndote aplicar los principios de TDD en diversos lenguajes de programación y frameworks actuales.</Typography>
        </div>
        <div className="img-block-small placeholder-img-tutorials"></div>
      </div>

      <div className="master-collage-container">
        
        <div className="collage-gallery-side">
          <div className="grid-collage-3">
            <div className="img-span-2 placeholder-img-collab-1"></div>
            <div className="img-single-small placeholder-img-collab-2"></div>
            <div className="img-single-small placeholder-img-collab-3"></div>
          </div>
          
          <div className="grid-collage-2">
            <div className="img-half placeholder-img-support-1"></div>
            <div className="img-half placeholder-img-support-2"></div>
          </div>
        </div>

        <div className="text-gallery-side">
          <div className="text-item-compact">
            <Typography variant="h4">Colaboración</Typography>
            <Typography variant="body1">Potencia tu crecimiento trabajando en equipo. TDDLab permite la revisión de código entre pares y la resolución de desafíos grupales, fomentando una comunidad donde el intercambio de conocimientos es la clave para alcanzar la excelencia técnica.</Typography>
          </div>
          <div className="text-item-compact">
            <Typography variant="h4">Apoyo</Typography>
            <Typography variant="body1">No estás solo en tu camino. Contamos con un asistente impulsado por inteligencia artificial y una comunidad activa listos para resolver tus dudas técnicas, ayudarte a depurar tus tests y ofrecerte retroalimentación constructiva en tiempo real.</Typography>
          </div>
        </div>

      </div>
    </Box>
  );
};