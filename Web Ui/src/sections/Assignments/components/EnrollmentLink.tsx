import React, { useState } from "react";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";

const InvitationComponent: React.FC = () => {
  const [mostrarLink, setMostrarLink] = useState(false);
  const link = "https://link-al-form.com";

  const generarLink = () => {
    setMostrarLink(true);
  };

  const copiarAlPortapapeles = () => {
    const inputLink = document.getElementById("linkText") as HTMLInputElement;
    if (inputLink) {
      inputLink.select();
      document.execCommand("copy");
      alert("Link copiado al portapapeles");
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={generarLink}>
        Generar Link de Invitación
      </Button>
      {mostrarLink && (
        <div>
          <Input type="text" id="linkText" value={link} readOnly />
          <Button
            variant="contained"
            color="primary"
            onClick={copiarAlPortapapeles}
          >
            Copiar
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvitationComponent;
