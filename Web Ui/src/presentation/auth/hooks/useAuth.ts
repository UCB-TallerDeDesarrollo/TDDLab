import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../modules/User-Authentication/domain/authStore";
import {
  handleAuthResult,
  // handleSignInWithGitHub,
  handleSignInWithGoogle,
} from "../services/authService";

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authData = useAuthStore((s) => s.authData);

  useEffect(() => {
    if (authData.userEmail) {
      navigate({ pathname: "/" });
    }
  }, [authData, navigate]);

  // const loginWithGitHub = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const userData = await handleSignInWithGitHub();
  //     await handleAuthResult({
  //       userData,
  //       isGoogle: false,
  //       onSuccess: () => navigate({ pathname: "/" }),
  //     });
  //   } catch (err: any) {
  //     const errorMessage = err?.message || "Error al iniciar sesión";
  //     if (errorMessage.includes("Google")) {
  //       setError("Este usuario está registrado con Google. Por favor, inicia sesión con Google.");
  //     } else if (errorMessage.includes("no encontrado") || errorMessage.includes("404")) {
  //       setError("Usuario no encontrado. Por favor, regístrate primero.");
  //     } else {
  //       setError(errorMessage);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await handleSignInWithGoogle();
      await handleAuthResult({
        userData,
        isGoogle: true,
        onSuccess: () => navigate({ pathname: "/" }),
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Error al iniciar sesión";
      if (errorMessage.includes("GitHub")) {
        setError("Este usuario está registrado con GitHub. Por favor, inicia sesión con GitHub.");
      } else if (errorMessage.includes("no encontrado") || errorMessage.includes("404")) {
        setError("Usuario no encontrado. Por favor, regístrate primero.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loginWithGoogle,
    loading,
    error,
    setError
  };
};
