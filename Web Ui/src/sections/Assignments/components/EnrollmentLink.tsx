import React, { useState } from "react";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import FileCopyIcon from "@mui/icons-material/FileCopy";

const InvitationComponent: React.FC = () => {
  const [mostrarLink, setMostrarLink] = useState(false);

  const generarLink = () => {
    setMostrarLink(true);
  };

  const currentPage: string = window.location.href + "invitation";

  const copiarAlPortapapeles = () => {
    const inputLink = document.getElementById("linkText") as HTMLInputElement;
    if (inputLink) {
      inputLink.select();

      try {
        navigator.clipboard.writeText(inputLink.value);
        alert("Link copiado al portapapeles");
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={generarLink}>
        Generar Link de Invitación
      </Button>
      {mostrarLink && (
        <div>
          <Input type="text" id="linkText" value={currentPage} readOnly />
          <Button
            variant="contained"
            color="primary"
            onClick={copiarAlPortapapeles}
          >
            <FileCopyIcon />
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvitationComponent;
