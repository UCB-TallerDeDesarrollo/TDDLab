import React, { useState } from "react";

const InvitationComponent: React.FC = () => {
  const [mostrarLink, setMostrarLink] = useState(false);
  const link = "https://link-al-form-aca.com";

  const generarLink = () => {
    setMostrarLink(true);
  };


  return (
    <div>
      <button onClick={generarLink}>Generar Link de Invitación</button>
      {mostrarLink && (
        <div>
          <input type="text" id="linkText" value={link} readOnly />

        </div>
      )}
    </div>
  );
};

export default InvitationComponent;
