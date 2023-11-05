import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface githubCredentialsAccount{
    photoAccount:string | null;
    nameAccount:string | null
}

function ConfirmationPopUp({ photoAccount,nameAccount}: githubCredentialsAccount) {
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClose = () => {
    setOpen(false);
  };

  return (
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Inició sesión correctamente"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {nameAccount || 'Usuario'} 
          </DialogContentText>
          <img src={ photoAccount ?? 'URL_POR_DEFECTO'} alt={nameAccount || 'Usuario'} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export default ConfirmationPopUp;