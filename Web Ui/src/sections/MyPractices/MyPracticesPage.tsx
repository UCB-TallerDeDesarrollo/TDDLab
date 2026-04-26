import MyPracticesPage from "../../features/my-practices/pages/MyPracticesPage";

interface PracticeManagerProps {
  userRole: string;
  userid: number;
}

function PracticeManager({ userRole, userid }: Readonly<PracticeManagerProps>) {
  return <MyPracticesPage userRole={userRole} userid={userid} />;
}

export default PracticeManager;
