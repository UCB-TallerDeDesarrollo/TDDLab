import { useNavigate } from "react-router-dom";

export const useLanding = () => {
  const navigate = useNavigate();

  const goToAuth = () => {
    navigate("/login");
  };

  return { goToAuth };
};

