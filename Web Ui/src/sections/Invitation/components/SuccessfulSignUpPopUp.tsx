import * as React from 'react';
import PopUp from './PopUp';
import { Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';

interface GithubAccountCredentials{
    photoAccount:string | null;
    nameAccount:string | null
}

function SuccessfulSignUpPopUp({ photoAccount,nameAccount}: Readonly<GithubAccountCredentials>) {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(!open);
    console.log(open);
  };

  const dialogContent:any = (
    <Card sx={{
        width: 400, // Establece un ancho fijo para el primer Card
        '&:hover': { boxShadow: 'md', borderColor: 'neutral.outlinedHoverBorder' },
      }} variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 100, height: 100, borderRadius: '10%', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    alt="Imagen"
                    height="100%"
                    width="100%"
                    image={photoAccount ?? 'URL_POR_DEFECTO'} // Reemplaza con la ruta de tu imagen.
                  />
                </div>
              </div>
            </Grid>
            <Grid item xs={8} container direction="column" justifyContent="space-between">
              <Grid item>
                <Typography variant="h5" sx={{ marginBottom: 1 }}>
                  {nameAccount ?? 'Usuario'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
  );

  return (
    <div>
        <PopUp 
            handleClose={handleClose} 
            open={open} 
            dialogTitle="Inicio de Sesión Exitoso" 
            dialogContent={dialogContent}>
        </PopUp>
    </div>
  );
}

export default SuccessfulSignUpPopUp;