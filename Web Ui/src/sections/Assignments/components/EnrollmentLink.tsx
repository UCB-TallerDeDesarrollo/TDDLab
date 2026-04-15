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
      <Button 
        onClick={generarLink}
        className="btn-std btn-primary"
      >
        Generar Link de Invitación
      </Button>
      {mostrarLink && (
        <div>
          <Input type="text" id="linkText" value={currentPage} readOnly />
          <Button
            className="btn-std btn-primary"
            onClick={copiarAlPortapapeles}
            style={{ minWidth: '50px' }}
          >
            <FileCopyIcon />
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvitationComponent;
