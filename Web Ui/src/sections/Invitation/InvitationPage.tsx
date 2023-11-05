import React, { useEffect, useState } from 'react';
import { getAuth, OAuthProvider, onAuthStateChanged, signInWithPopup, User, signOut } from 'firebase/auth';
import firebase from '../../firebaseConfig'; // Importa la instancia de Firebase
import SuccessfulSignUpPopUp from './components/SuccessfulSignUpPopUp';
import SuccessfulEnrollmentPopUp from './components/SuccessfulEnrollmentPopUp';
import Button from '@mui/material/Button';
import GitHubIcon from '@mui/icons-material/GitHub';

const AuthComponent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth(firebase);
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
      console.log(auth,result)
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

  const [showPopUp, setShowPopUp] = useState(false);

  const handleAcceptInvitation = () => {
    setShowPopUp(true);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Bienvenido, {user.displayName}</p>
          <img src={user.photoURL ?? 'URL_POR_DEFECTO'} alt={user.displayName ?? 'Usuario'} />
          <Button onClick={handleSignOut}>Cerrar sesión</Button>
          <Button onClick={handleAcceptInvitation}>Aceptar invitación al curso</Button>
          {showPopUp && (
            <SuccessfulEnrollmentPopUp></SuccessfulEnrollmentPopUp>
          )}
        </div>
      ) : (
        <Button       
            color="primary"
            aria-label="GitHub" 
            onClick={handleSignInWithGitHub}
          >
            <GitHubIcon></GitHubIcon>
            Iniciar Sesión
        </Button>
      )}

      {user && (
        <SuccessfulSignUpPopUp photoAccount={user.photoURL} nameAccount={user.displayName}></SuccessfulSignUpPopUp>
      )}
    </div>
  );
};

export default AuthComponent;
