import React, { useEffect, useState } from 'react';
import { getAuth, OAuthProvider, onAuthStateChanged, signInWithPopup, User, signOut } from 'firebase/auth';
import firebase from '../../firebaseConfig'; // Importa la instancia de Firebase
import ConfirmationPopUp from './PopUp';

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
      const auth = getAuth(firebase); // Obtén la instancia de autenticación aquí
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Error de autenticación con GitHub', error);
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth(firebase);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };


  return (
    <div>
      {user ? (
        <div>
          <p>Bienvenido, {user.displayName}</p>
          <img src={user.photoURL ?? 'URL_POR_DEFECTO'} alt={user.displayName || 'Usuario'} />
          <button onClick={handleSignOut}>Cerrar sesión</button>
        </div>
      ) : (
        <button onClick={handleSignInWithGitHub}>Iniciar sesión con GitHub</button>
      )}
      {user && (
          <div className="popup">
            <ConfirmationPopUp photoAccount={user.photoURL} nameAccount={user.displayName}></ConfirmationPopUp>
          </div>
      )}
    </div>
  );
};

export default AuthComponent;
