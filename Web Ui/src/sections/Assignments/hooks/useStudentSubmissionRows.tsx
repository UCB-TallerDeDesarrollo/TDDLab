import { useEffect, useMemo, useState } from "react";
import { formatDate } from "../../../utils/dateUtils";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";
import { getDisplayStatus, isStudent } from "../utils/assignmentDetailHelpers";

export interface SubmissionRowData {
  id: number;
  studentEmail: string;
  status: string;
  repositoryLink: string;
  startDate: string;
  endDate: string;
  comment: string;
  disableButtons: boolean;
  showAdditionalGraphs: boolean;
  disableAdditionalGraphs: boolean;
  onViewGraph: () => void;
  onOpenAssistant: () => void;
  onAdditionalGraphs: () => void;
}

interface UseStudentSubmissionRowsOptions {
  submissions: SubmissionDataObject[];
  role: string;
  disableAdditionalGraphs: boolean;
  onRedirectAdmin: (
    link: string,
    fetchedSubmissions: SubmissionDataObject[],
    submissionId: number,
    url: string
  ) => void;
  onOpenAssistant: (repositoryLink: string) => void;
}

export const useStudentSubmissionRows = (
  options: UseStudentSubmissionRowsOptions
): SubmissionRowData[] => {
  const {
    submissions,
    role,
    disableAdditionalGraphs,
    onRedirectAdmin,
    onOpenAssistant,
  } = options;

  const usersRepository = useMemo(() => new UsersRepository(), []);
  const [studentRows, setStudentRows] = useState<SubmissionRowData[]>([]);

  useEffect(() => {
    const buildRows = async () => {
      const rows = await Promise.all(
        submissions.map(async (submission) => {
          let studentEmail = "";
          try {
            const student = await usersRepository.getUserById(submission.userid);
            studentEmail = student.email;
          } catch (error) {
            console.error("Error fetching student email:", error);
          }

          const startDate = formatDate(submission.start_date.toString());
          const endDate = submission.end_date
            ? formatDate(submission.end_date.toString())
            : "N/A";

          return {
            id: submission.id,
            studentEmail,
            status: getDisplayStatus(submission.status),
            repositoryLink: submission.repository_link,
            startDate,
            endDate,
            comment: submission.comment || "N/A",
            disableButtons: submission.repository_link === "",
            showAdditionalGraphs: !isStudent(role),
            disableAdditionalGraphs,
            onViewGraph: () => {
              localStorage.setItem("selectedMetric", "Dashboard");
              onRedirectAdmin(
                submission.repository_link,
                submissions,
                submission.id,
                "/graph"
              );
            },
            onOpenAssistant: () => onOpenAssistant(submission.repository_link),
            onAdditionalGraphs: () => {
              localStorage.setItem("selectedMetric", "Complejidad");
              onRedirectAdmin(
                submission.repository_link,
                submissions,
                submission.id,
                "/aditionalgraph"
              );
            },
          } satisfies SubmissionRowData;
        })
      );

      setStudentRows(rows);
    };

    buildRows();
  }, [
    submissions,
    role,
    disableAdditionalGraphs,
    onRedirectAdmin,
    onOpenAssistant,
    usersRepository,
  ]);

  return studentRows;
};
