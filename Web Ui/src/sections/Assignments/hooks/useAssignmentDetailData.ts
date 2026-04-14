import { useCallback, useEffect, useMemo, useState } from "react";
import { GetAssignmentDetail } from "../../../modules/Assignments/application/GetAssignmentDetail";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import { GetGroupDetail } from "../../../modules/Groups/application/GetGroupDetail";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import { GetFeatureFlagByName } from "../../../modules/FeatureFlags/application/GetFeatureFlagByName";
import SubmissionRepository from "../../../modules/Submissions/Repository/SubmissionRepository";
import { GetSubmissionsByAssignmentId } from "../../../modules/Submissions/Aplication/getSubmissionsByAssignmentId";
import { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";
import { GetSubmissionByUserandAssignmentId } from "../../../modules/Submissions/Aplication/getSubmissionByUseridandSubmissionid";

export const useAssignmentDetail = (assignmentId: number) => {
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(null);
  const assignmentsRepository = useMemo(() => new AssignmentsRepository(), []);
  const getAssignmentDetail = useMemo(
    () => new GetAssignmentDetail(assignmentsRepository),
    [assignmentsRepository]
  );

  useEffect(() => {
    getAssignmentDetail
      .obtainAssignmentDetail(assignmentId)
      .then((fetchedAssignment) => {
        setAssignment(fetchedAssignment);
      })
      .catch((error) => {
        console.error("Error fetching assignment:", error);
      });
  }, [assignmentId, getAssignmentDetail]);

  return assignment;
};

export const useGroupDetail = (groupId?: number) => {
  const [groupDetails, setGroupDetails] = useState<GroupDataObject | null>(null);
  const groupsRepository = useMemo(() => new GroupsRepository(), []);
  const getGroupDetail = useMemo(
    () => new GetGroupDetail(groupsRepository),
    [groupsRepository]
  );

  useEffect(() => {
    if (!groupId) {
      return;
    }

    getGroupDetail
      .obtainGroupDetail(groupId)
      .then((fetchedGroupDetails) => {
        setGroupDetails(fetchedGroupDetails);
      })
      .catch((error) => {
        console.error("Error fetching group details:", error);
      });
  }, [getGroupDetail, groupId]);

  return groupDetails;
};

type FeatureFlagOptions = {
  enabled?: boolean;
  defaultValue?: boolean;
  fallbackValue?: boolean;
};

export const useFeatureFlagEnabled = (
  flagName: string,
  options?: FeatureFlagOptions
) => {
  const { enabled = true, defaultValue = false, fallbackValue } = options ?? {};
  const [isEnabled, setIsEnabled] = useState(defaultValue);
  const getFlagUseCase = useMemo(() => new GetFeatureFlagByName(), []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const fetchFlag = async () => {
      try {
        const flag = await getFlagUseCase.execute(flagName);
        const resolvedValue = flag?.is_enabled ?? fallbackValue ?? defaultValue;
        setIsEnabled(resolvedValue);
      } catch (error) {
        console.error(`Error fetching feature flag ${flagName}:`, error);
      }
    };

    fetchFlag();
  }, [defaultValue, enabled, fallbackValue, flagName, getFlagUseCase]);

  return isEnabled;
};

export const useSubmissionByUserAndAssignment = (
  assignmentId: number,
  userId: number
) => {
  const [submission, setSubmission] = useState<SubmissionDataObject | null>(null);
  const submissionRepository = useMemo(() => new SubmissionRepository(), []);
  const submissionData = useMemo(
    () => new GetSubmissionByUserandAssignmentId(submissionRepository),
    [submissionRepository]
  );

  useEffect(() => {
    const fetchSubmission = async () => {
      if (assignmentId && userId && userId !== -1) {
        try {
          if (assignmentId < 0 || userId < 0) {
            return;
          }

          const fetchedSubmission =
            await submissionData.getSubmisssionByUserandSubmissionId(
              assignmentId,
              userId
            );
          setSubmission(fetchedSubmission);
        } catch (error) {
          console.error("Error verifying submission status:", error);
        }
      }
    };

    fetchSubmission();
  }, [assignmentId, submissionData, userId]);

  return submission;
};

export const useAssignmentSubmissions = (
  assignmentId: number,
  enabled: boolean
) => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionDataObject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const submissionRepository = useMemo(() => new SubmissionRepository(), []);
  const getSubmissionsByAssignmentId = useMemo(
    () => new GetSubmissionsByAssignmentId(submissionRepository),
    [submissionRepository]
  );

  const fetchSubmissions = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedSubmissions =
        await getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(
          assignmentId
        );
      setSubmissions(fetchedSubmissions);
    } catch (error) {
      setError("Error fetching submissions. Please try again later.");
      console.error("Error fetching SubmissionByAssignmentAndUser:", error);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, enabled, getSubmissionsByAssignmentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, loading, error, refresh: fetchSubmissions };
};

export const useStudentSubmission = (
  assignmentId: number,
  userId: number,
  enabled: boolean
) => {
  const [studentSubmission, setStudentSubmission] =
    useState<SubmissionDataObject>();
  const [error, setError] = useState<string | null>(null);
  const submissionRepository = useMemo(() => new SubmissionRepository(), []);
  const getSubmissionsByAssignmentId = useMemo(
    () => new GetSubmissionsByAssignmentId(submissionRepository),
    [submissionRepository]
  );

  useEffect(() => {
    const fetchStudentSubmission = async () => {
      if (!enabled) {
        return;
      }

      if (assignmentId && userId && userId !== -1) {
        try {
          const allSubmissions =
            await getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(
              assignmentId
            );
          const userSubmission = allSubmissions.find(
            (submission) => submission.userid === userId
          );
          if (userSubmission) {
            setStudentSubmission(userSubmission);
          }
        } catch (error) {
          console.error("Error fetching student submission:", error);
          setError("An error occurred while fetching the student submission.");
        }
      }
    };

    fetchStudentSubmission();
  }, [assignmentId, enabled, getSubmissionsByAssignmentId, userId]);

  return { studentSubmission, error };
};
