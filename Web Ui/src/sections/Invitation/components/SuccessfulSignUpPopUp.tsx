import * as React from 'react';
import DialogContentText from '@mui/material/DialogContentText';
import PopUp from './PopUp';

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
    <>
        <DialogContentText>
            {nameAccount ?? 'Usuario'}
        </DialogContentText>
        <img src={photoAccount ?? 'URL_POR_DEFECTO'} alt={nameAccount ?? 'Usuario'} />
    </>
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