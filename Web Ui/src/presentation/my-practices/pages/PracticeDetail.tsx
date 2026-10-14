import PracticeDetailPage from "./PracticeDetailPage";

interface PracticeDetailProps {
  title: string;
  role: string;
  userid: number;
}

export default function PracticeDetail({ userid, role }: Readonly<PracticeDetailProps>) {
  return <PracticeDetailPage userid={userid} role={role} />;
}
