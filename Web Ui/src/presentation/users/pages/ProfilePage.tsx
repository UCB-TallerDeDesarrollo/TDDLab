import { useEffect, useState } from "react";

export const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUser);
  }, []);

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Rol: {user.role}</p>
    </div>
  );
};

export default ProfilePage;
