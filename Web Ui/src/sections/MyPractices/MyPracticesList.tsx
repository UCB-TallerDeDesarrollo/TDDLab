import { useGlobalState } from "../../modules/User-Authentication/domain/authStates";
import PracticesList from "../../features/my-practices/components/PracticesList";

interface PracticesProps {
  ShowForm: () => void;
  userRole: string;
  refreshToken: number;
}

function Practices({ userRole }: Readonly<PracticesProps>) {
  const [authData] = useGlobalState("authData");
  return <PracticesList userRole={userRole} userid={authData.userid || 0} />;
}

export default Practices;
