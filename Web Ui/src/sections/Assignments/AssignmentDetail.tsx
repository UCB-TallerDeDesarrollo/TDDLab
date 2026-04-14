import AssignmentDetailContainer, {
  AssignmentDetailProps,
} from "./AssignmentDetailContainer";

const AssignmentDetail: React.FC<AssignmentDetailProps> = (props) => {
  return <AssignmentDetailContainer {...props} />;
};

export default AssignmentDetail;