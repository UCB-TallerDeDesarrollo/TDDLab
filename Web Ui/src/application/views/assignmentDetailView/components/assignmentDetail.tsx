import React, { useEffect, useState } from 'react';
import { fetchAssignmentUseCase } from '../useCases/fetchAssignmentAdapter';
import { formatDate } from '../../../../application/utils/dateUtils';
// Import the AssignmentDataObject type
import { AssignmentDataObject } from '../../../../domain/models/assignmentInterfaces';

interface AssignmentDetailProps {
  id: number;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({ id }) => {
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(null);

  useEffect(() => {
    // Fetch the assignment by its ID when the component mounts
    fetchAssignmentUseCase(id)
      .then((fetchedAssignment) => {
        setAssignment(fetchedAssignment);
      })
      .catch((error) => {
        console.error('Error fetching assignment:', error);
      });
  }, [id]); // The effect will re-run whenever the "id" prop changes



  return (
    <div>
      {assignment ? (
        <div>
          <h2>{assignment.title}</h2>
          <p>Description: {assignment.description}</p>
          <p>Start Date: {formatDate(assignment.start_date)}</p>
          <p>End Date: {formatDate(assignment.end_date)}</p>
          <p>State: {assignment.state}</p>
        </div>
      ) : (
        <p>Loading assignment...</p>
      )}
    </div>
  );
};

export default AssignmentDetail;
