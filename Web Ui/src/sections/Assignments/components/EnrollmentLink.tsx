import React, { useState } from "react";

const InvitationComponent: React.FC = () => {
  const [mostrarLink, setMostrarLink] = useState(false);
  const link = "https://link-al-form-aca.com";

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
      <button onClick={generarLink}>Generar Link de Invitación</button>
      {mostrarLink && (
        <div>
          <input type="text" id="linkText" value={link} readOnly />
          <button onClick={copiarAlPortapapeles}>Copiar</button>
        </div>
      )}
    </div>
  );
};

export default InvitationComponent;
