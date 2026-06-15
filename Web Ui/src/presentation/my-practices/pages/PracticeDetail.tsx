import PracticeDetailPage from "./PracticeDetailPage";

interface PracticeDetailProps {
  title: string;
  userid: number;
}

export default function PracticeDetail({ userid }: Readonly<PracticeDetailProps>) {
  return <PracticeDetailPage userid={userid} />;
}
