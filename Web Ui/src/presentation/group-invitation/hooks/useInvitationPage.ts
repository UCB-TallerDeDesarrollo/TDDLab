import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { useLocation } from "react-router-dom";
import {
  registerInvitationUser,
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

function getQueryParam(search: string, param: string): string | number | undefined {
  const searchParams = new URLSearchParams(search);
  const value = searchParams.get(param);

  if (param === "groupid") {
    return value ? Number.parseInt(value, 10) : undefined;
  }

  return value ?? undefined;
}

export function useInvitationPage() {
  const location = useLocation();
  const groupid = getQueryParam(location.search, "groupid");
  const userType = getQueryParam(location.search, "type");

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

  const handleSignUpWithGoogle = async () => {
    setIsLoading(true);
    try {
      const session = await signInInvitationWithGoogle();
      if (session) {
        setUser(session.user);
        setAuthProvider(session.authProvider);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (role: InvitationRole) => {
    setIsLoading(true);
    try {
      if (!user?.email) {
        return;
      }

      const userGroupid = typeof groupid === "number" ? groupid : Number(groupid) || 1;

      try {
        await registerInvitationUser({
          authProvider,
          groupid: userGroupid,
          role,
          user,
        });
      } catch (error) {
        console.error("Error al registrar invitación:", error);
        setOpenPopup(true);
        return;
      }

      setShowPopUp(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePassVerification = async (password: string) => {
    setIsLoading(true);
    try {
      const result = await verifyInvitationPassword(password);

      if (result === true) {
        await handleAcceptInvitation("teacher");
        return;
      }

      setFeedbackMessage("Contraseña inválida");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
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
