import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState } from "../../../modules/User-Authentication/domain/authStates";
import {
  handleAuthResult,
  handleGoogleRedirectResult,
  handleSignInWithGoogle,
} from "../services/authService";

let googleRedirectCompletion: Promise<void> | undefined;

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

  const completeGoogleRedirect = useCallback(() => {
    if (!googleRedirectCompletion) {
      googleRedirectCompletion = (async () => {
        try {
          const userData = await handleGoogleRedirectResult();
          if (!userData) {
            return;
          }

          setLoading(true);
          setError(null);
          await handleAuthResult({
            userData,
            onSuccess: () => navigate({ pathname: "/" }),
          });
        } catch (err: unknown) {
          const errorMessage = getAuthErrorMessage(err) || "Error al iniciar sesi\u00f3n";
          if (errorMessage.includes("no encontrado") || errorMessage.includes("404")) {
            setError("Usuario no encontrado. Por favor, reg\u00edstrate primero.");
          } else {
            setError(errorMessage);
          }
        } finally {
          setLoading(false);
        }
      })();
    }

    return googleRedirectCompletion;
  }, [navigate]);

  useEffect(() => {
    if (authData?.[0]?.userEmail) {
      navigate({ pathname: "/" });
    }
  }, [authData, navigate]);

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
        onSuccess: () => navigate({ pathname: "/" }),
      });
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err) || "Error al iniciar sesión";
      if (errorMessage.includes("no encontrado") || errorMessage.includes("404")) {
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
    completeGoogleRedirect,
    loading,
    error,
    setError
  };
};
