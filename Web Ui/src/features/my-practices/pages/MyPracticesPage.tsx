import { styled } from "@mui/system";
import PracticesList from "../components/PracticesList";

const PracticesContainer = styled("div")({
  justifyContent: "center",
  alignItems: "center",
});

interface MyPracticesPageProps {
  userRole: string;
  userid: number;
}

function MyPracticesPage({ userRole, userid }: Readonly<MyPracticesPageProps>) {
  return (
    <PracticesContainer data-testid="assignments-container">
      <PracticesList userRole={userRole} userid={userid} />
    </PracticesContainer>
  );
}

export default MyPracticesPage;
