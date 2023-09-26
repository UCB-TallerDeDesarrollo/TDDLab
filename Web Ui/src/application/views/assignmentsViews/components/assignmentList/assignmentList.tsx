// application/components/AssignmentList.tsx
import React from 'react';
import { AssignmentDataObject } from '../../../../../domain/models/assignmentInterfaces'; // Import your assignment model
//import { formatDate } from '../../../utils/dateUtils';
interface AssignmentListProps {
  assignments: AssignmentDataObject[];
}

const AssignmentList: React.FC<AssignmentListProps> = ({ assignments }) => {
  return (
    <div>
      {assignments.map((assignment) => (
        <div key={assignment.id} className="assignment-card">
          <h2>{assignment.title}</h2>
          <p>Description: {assignment.description}</p>
          <p>State: {assignment.state}</p>
         {/* <p>Start Date: {formatDate(assignment.start_date)}</p>  Format start_date */}
         {/* <p>End Date: {formatDate(assignment.end_date)}</p>  Format end_date */}
        </div>
      ))}
    </div>
  );
};

export default AssignmentList;
