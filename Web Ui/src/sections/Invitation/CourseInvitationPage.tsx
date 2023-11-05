import React, { useEffect, useState } from 'react';
import { getAuth, OAuthProvider, onAuthStateChanged, signInWithPopup, User } from 'firebase/auth';
import firebase from '../../firebaseConfig'; // Importa la instancia de Firebase

const AuthComponent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth(firebase); // Utiliza la instancia de Firebase
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignInWithGitHub = async () => {
    const provider = new OAuthProvider('github.com');
    try {
      await signInWithPopup(getAuth(firebase), provider); // Utiliza la instancia de Firebase
    } catch (error) {
      console.error('Error de autenticación con GitHub', error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Bienvenido, {user.displayName}</p>
          <img src={user.photoURL ?? 'URL_POR_DEFECTO'} alt={user.displayName || 'Usuario'} />
          <button onClick={handleSignInWithGitHub}>Iniciar sesión con GitHub</button>
        </div>
      ) : (
        <button onClick={handleSignInWithGitHub}>Iniciar sesión con GitHub</button>
      )}
    </div>
  );
};

export default AuthComponent;
