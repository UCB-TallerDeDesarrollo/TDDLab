import { useEffect, useState, MouseEvent } from "react";
import { User } from "firebase/auth";
import { useLocation } from "react-router-dom";
import {
  registerInvitationUser,
  signInInvitationWithGithub,
  signInInvitationWithGoogle,
  signOutInvitationSession,
  subscribeToInvitationAuth,
  verifyInvitationPassword,
} from "../services/invitation.service";
import {
  InvitationAuthProvider,
  InvitationRole,
  RotationState,
} from "../types/invitation.types";

function parseQueryParam(search: string, param: string): string | number | undefined {
  const searchParams = new URLSearchParams(search);
  const value = searchParams.get(param);

  if (!value) return undefined;
  if (param === "groupid") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return value;
}

export function useInvitationPage() {
  const location = useLocation();
  const groupid = parseQueryParam(location.search, "groupid");
  const userType = parseQueryParam(location.search, "type");

  const [user, setUser] = useState<User | null>(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [rotation, setRotation] = useState<RotationState>({ rotateX: 0, rotateY: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<InvitationAuthProvider>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    return subscribeToInvitationAuth((authUser, provider) => {
      setUser(authUser);
      setAuthProvider(provider);
    });
  }, []);

  useEffect(() => {
    if (userType === "admin") {
      setShowAdminModal(true);
    }
  }, [userType]);

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      await signInInvitationWithGithub();
    } catch (error) {
      console.error("Error al iniciar sesión con GitHub:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInInvitationWithGoogle();
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (role: InvitationRole) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userGroupid = typeof groupid === "number" ? groupid : 1;

      await registerInvitationUser({
        authProvider,
        groupid: userGroupid,
        role,
        user,
      });

      setShowPopUp(true);
    } catch (error) {
      console.error("Error al registrar invitación:", error);
      setOpenPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePassVerification = async (password: string) => {
    setIsLoading(true);
    try {
      const isValid = await verifyInvitationPassword(password);
      if (isValid) {
        await handleAcceptInvitation("teacher");
      } else {
        setFeedbackMessage("Contraseña inválida");
      }
    } catch (error) {
      console.error("Error al verificar contraseña:", error);
      setFeedbackMessage("Error al verificar contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);

    setRotation({
      rotateY: (x / width) * 30,
      rotateX: -(y / height) * 30,
    });
  };

  const handleMouseLeave = () => {
    setRotation({ rotateX: 0, rotateY: 0 });
  };

  return {
    authProvider,
    feedbackMessage,
    handleAcceptInvitation,
    handleMouseLeave,
    handleMouseMove,
    handlePassVerification,
    handleSignOut: signOutInvitationSession,
    handleSignUp,
    handleSignUpWithGoogle,
    isLoading,
    openPopup,
    rotation,
    setFeedbackMessage,
    setShowPasswordPopup,
    showAdminModal,
    showPasswordPopup,
    showPopUp,
    user,
    userType,
  };
}
