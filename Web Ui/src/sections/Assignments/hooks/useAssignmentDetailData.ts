import { useEffect, useState } from "react";
import { GetAssignmentDetail } from "../../../modules/Assignments/application/GetAssignmentDetail";
import { GetGroupDetail } from "../../../modules/Groups/application/GetGroupDetail";
import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import AssignmentsRepository from "../../../modules/Assignments/repository/AssignmentsRepository";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { GetFeatureFlagByName } from "../../../modules/FeatureFlags/application/GetFeatureFlagByName";
import SubmissionRepository from "../../../modules/Submissions/Repository/SubmissionRepository";
import { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";
import { GetSubmissionsByAssignmentId } from "../../../modules/Submissions/Aplication/getSubmissionsByAssignmentId";
import { GetSubmissionByUserandAssignmentId } from "../../../modules/Submissions/Aplication/getSubmissionByUseridandSubmissionid";
import { isStudent } from "../utils/assignmentDetailHelpers";

interface UseAssignmentDetailDataParams {
  assignmentid: number;
  userid: number;
  role: string;
}

export function useAssignmentDetailData({ assignmentid, userid, role }: UseAssignmentDetailDataParams) {
  const [assignment, setAssignment] = useState<AssignmentDataObject | null>(null);
  const [groupDetails, setGroupDetails] = useState<GroupDataObject | null>(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionDataObject[]>([]);
  const [studentSubmission, setStudentSubmission] = useState<SubmissionDataObject>();
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionDataObject | null>(null);
  const [showIAButton, setShowIAButton] = useState(false);
  const [disableAdditionalGraphs, setDisableAdditionalGraphs] = useState(true);

  useEffect(() => {
    const fetchFlag = async () => {
      if (!isStudent(role)) {
        const getFlagUseCase = new GetFeatureFlagByName();
        try {
          const flag = await getFlagUseCase.execute("Mostrar Graficas Adicionales");
          setDisableAdditionalGraphs(!(flag?.is_enabled));
        } catch (error) {
          console.error("Error al obtener el flag Mostrar Graficas Adicionales", error);
          setDisableAdditionalGraphs(true);
        }
      }
    };

    fetchFlag();
  }, [role]);

  useEffect(() => {
    if (!isStudent(role)) {
      return;
    }

    const getFlagUseCase = new GetFeatureFlagByName();

    const fetchFeatureFlag = async () => {
      try {
        const flag = await getFlagUseCase.execute("Boton Asistente IA");
        setShowIAButton(flag?.is_enabled ?? true);
      } catch (error) {
        console.error("Error fetching feature flag IA_ASSISTANT:", error);
      }
    };

    fetchFeatureFlag();
  }, [role]);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (assignmentid && userid && userid !== -1) {
        try {
          const submissionRepository = new SubmissionRepository();
          const submissionData = new GetSubmissionByUserandAssignmentId(submissionRepository);

          if (assignmentid < 0 || userid < 0) {
            return;
          }

          const fetchedSubmission = await submissionData.getSubmisssionByUserandSubmissionId(assignmentid, userid);
          setSubmission(fetchedSubmission);
        } catch (error) {
          console.error("Error verifying submission status:", error);
        }
      }
    };

    fetchSubmission();
  }, [assignmentid, userid]);

  useEffect(() => {
    const assignmentsRepository = new AssignmentsRepository();
    const getAssignmentDetail = new GetAssignmentDetail(assignmentsRepository);

    getAssignmentDetail
      .obtainAssignmentDetail(assignmentid)
      .then((fetchedAssignment) => {
        setAssignment(fetchedAssignment);
      })
      .catch((error) => {
        console.error("Error fetching assignment:", error);
      });
  }, [assignmentid]);

  useEffect(() => {
    const groupsRepository = new GroupsRepository();
    const getGroupDetail = new GetGroupDetail(groupsRepository);

    if (assignment?.groupid) {
      getGroupDetail
        .obtainGroupDetail(assignment.groupid)
        .then((fetchedGroupDetails) => {
          setGroupDetails(fetchedGroupDetails);
        })
        .catch((error) => {
          console.error("Error fetching group details:", error);
        });
    }
  }, [assignment]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!isStudent(role)) {
        setLoadingSubmissions(true);
        setSubmissionsError(null);
        try {
          const submissionRepository = new SubmissionRepository();
          const getSubmissionsByAssignmentId = new GetSubmissionsByAssignmentId(submissionRepository);
          const fetchedSubmissions = await getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(assignmentid);
          setSubmissions(fetchedSubmissions);
        } catch (error) {
          setSubmissionsError("Error fetching submissions. Please try again later.");
          console.error("Error fetching SubmissionByAssignmentAndUser:", error);
        } finally {
          setLoadingSubmissions(false);
        }
      }
    };

    fetchSubmissions();
  }, [assignmentid, role]);

  useEffect(() => {
    const fetchStudentSubmission = async () => {
      if (isStudent(role)) {
        if (assignmentid && userid && userid !== -1) {
          try {
            const submissionRepository = new SubmissionRepository();
            const getSubmissionsByAssignmentId = new GetSubmissionsByAssignmentId(submissionRepository);
            const allSubmissions = await getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(assignmentid);
            const userSubmission = allSubmissions.find((submissionItem) => submissionItem.userid === userid);
            if (userSubmission) {
              setStudentSubmission(userSubmission);
            }
          } catch (error) {
            console.error("Error fetching student submission:", error);
            setSubmissionsError("An error occurred while fetching the student submission.");
          }
        }
      }
    };

    fetchStudentSubmission();
  }, [assignmentid, userid, role]);

  return {
    assignment,
    groupDetails,
    loadingSubmissions,
    submissions,
    studentSubmission,
    submissionsError,
    submission,
    showIAButton,
    disableAdditionalGraphs,
    setSubmission,
    setStudentSubmission,
    setSubmissions,
  };
}
