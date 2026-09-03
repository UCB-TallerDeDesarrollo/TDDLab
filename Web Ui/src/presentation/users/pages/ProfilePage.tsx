import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";


export const ProfilePage = () => {
  // Consumimos el estado global que ya se cargó en App.tsx
  const [authData] = useGlobalState("authData");

  // Validamos si la data del usuario ya está resuelta
  if (!authData || authData.userid === -1) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Perfil de Usuario</h2>
      <p>Email: {authData.userEmail}</p>
      <p>Rol: {authData.userRole}</p>
      {/* Si decides mostrar la foto de perfil: */}
      {authData.userProfilePic && (
        <img src={authData.userProfilePic} alt="Perfil" width="100" />
      )}
    </div>
  );
};

export default ProfilePage;