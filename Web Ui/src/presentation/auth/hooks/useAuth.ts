import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import {
  handleAuthResult,
  handleGoogleRedirectResult,
  handleSignInWithGitHub,
  handleSignInWithGoogle,
} from "../services/authService";

function getAuthErrorMessage(err: unknown) {
  if (err instanceof Error) {
    return err.message;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    return err.message;
  }

  return "Error al iniciar sesión";
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authData = useGlobalState("authData");

  useEffect(() => {
    if (authData?.[0]?.userEmail) {
      navigate({ pathname: "/" });
    }
  }, [authData, navigate]);

  useEffect(() => {
    const finishGoogleRedirectLogin = async () => {
      try {
        const userData = await handleGoogleRedirectResult();

        if (!userData) {
          return;
        }

        setLoading(true);
        setError(null);
        await handleAuthResult({
          userData,
          isGoogle: true,
          onSuccess: () => navigate({ pathname: "/" }),
        });
      } catch (err) {
        const errorMessage = getAuthErrorMessage(err);
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

    finishGoogleRedirectLogin();
  }, [navigate]);

  const loginWithGitHub = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await handleSignInWithGitHub();
      await handleAuthResult({
        userData,
        isGoogle: false,
        onSuccess: () => navigate({ pathname: "/" }),
      });
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      if (errorMessage.includes("Google")) {
        setError("Este usuario está registrado con Google. Por favor, inicia sesión con Google.");
      } else if (errorMessage.includes("no encontrado") || errorMessage.includes("404")) {
        setError("Usuario no encontrado. Por favor, regístrate primero.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await handleSignInWithGoogle();
      if (!userData) {
        return;
      }

      await handleAuthResult({
        userData,
        isGoogle: true,
        onSuccess: () => navigate({ pathname: "/" }),
      });
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
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
    loginWithGitHub,
    loginWithGoogle,
    loading,
    error,
    setError
  };
};
