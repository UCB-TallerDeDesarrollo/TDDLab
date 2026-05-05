import { Box, Typography, Grid } from "@mui/material";

export const BenefitsSection = () => {
  return (
    <Box className="benefits-section">
      <Typography variant="h4" className="section-title">
        Recursos y beneficios:
      </Typography>

      {/* Fila 1: Guías */}
      <Box className="benefit-row">
        <Box className="benefit-text">
          <Typography variant="h5">Guías</Typography>
          <Typography variant="body1">
            Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
          </Typography>
        </Box>
        <Box className="benefit-image placeholder-img-guides" />
      </Box>

      {/* Fila 2: Tutoriales */}
      <Box className="benefit-row">
        <Box className="benefit-text">
          <Typography variant="h5">Tutoriales</Typography>
          <Typography variant="body1">
            Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
          </Typography>
        </Box>
        <Box className="benefit-image placeholder-img-tutorials" />
      </Box>

      {/* Grid Inferior: Colaboración y Apoyo */}
      <Grid container spacing={4} className="benefits-grid">
        <Grid item xs={12} md={6} className="benefit-grid-item">
          <Box className="benefit-image-small placeholder-img-collab" />
          <Box className="benefit-text-small">
            <Typography variant="h6">Colaboración</Typography>
            <Typography variant="body2">
              Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} className="benefit-grid-item">
          <Box className="benefit-image-small placeholder-img-support" />
          <Box className="benefit-text-small">
            <Typography variant="h6">Apoyo</Typography>
            <Typography variant="body2">
              Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};