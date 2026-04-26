import React from "react";
import PracticeDetailPage from "../../features/my-practices/pages/PracticeDetailPage";

interface PracticeDetailProps {
  title: string;
  userid: number;
}

const PracticeDetail: React.FC<PracticeDetailProps> = ({ userid }) => (
  <PracticeDetailPage userid={userid} />
);

export default PracticeDetail;
