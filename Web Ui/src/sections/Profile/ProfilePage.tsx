import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import "./styles/ProfileStyles.css";

function ProfilePage() {
  const [authData] = useGlobalState("authData");

  const roleLabel =
    authData?.userRole === "teacher"
      ? "Docente"
      : authData?.userRole === "student"
      ? "Estudiante"
      : authData?.userRole || "Sin rol";

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={authData?.userProfilePic || "/default-user.png"}
            alt="profile"
            className="profile-avatar"
          />

          <h2>{authData?.userEmail || "Usuario"}</h2>
        </div>

        <div className="profile-info">
          <p>
            <strong>CORREO:</strong> {authData?.userEmail || "Sin correo"}
          </p>

          <p>
            <strong>ROL:</strong> {roleLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;