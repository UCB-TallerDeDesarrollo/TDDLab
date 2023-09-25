// application/components/AssignmentList.tsx
import React from 'react';
import { AssignmentDataObject } from '../../domain/models/assignmentInterfaces'; // Import your assignment model

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
          <p>Start Date: {assignment.start_date}</p>
          <p>End Date: {assignment.end_date}</p>
          <p>State: {assignment.state}</p>
        </div>
      ))}
    </div>
  );
};

export default AssignmentList;
