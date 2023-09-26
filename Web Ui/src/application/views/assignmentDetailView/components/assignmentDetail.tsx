// application/components/AssignmentList.tsx
import React from 'react';
//import { formatDate } from '../../../utils/dateUtils';
interface AssignmentDetailProps {
  id: number;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  id,}) => {
  return (
    <div>
        {id}  
    </div>
  );
};

export default AssignmentDetail;
