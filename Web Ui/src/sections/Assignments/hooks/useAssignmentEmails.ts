import { useMemo, useState, useEffect } from "react";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";

export const useAssignmentEmails = (submissions: SubmissionDataObject[]) => {
  const [studentEmails, setStudentEmails] = useState<Record<number, string>>({});
  const usersRepository = useMemo(() => new UsersRepository(), []);

  const missingUserIds = useMemo(() => {
    const uniqueIds = new Set(submissions.map((item) => item.userid));
    return Array.from(uniqueIds).filter(
      (studentId) => studentEmails[studentId] === undefined
    );
  }, [studentEmails, submissions]);

  useEffect(() => {
    const loadStudentEmails = async () => {
      if (missingUserIds.length === 0) {
        return;
      }

      const results = await Promise.allSettled(
        missingUserIds.map(async (studentId) => {
          const student = await usersRepository.getUserById(studentId);
          return [studentId, student.email] as const;
        })
      );

      const entries = results.flatMap((result) => {
        if (result.status === "fulfilled") {
          return [result.value];
        }

        console.error("Error fetching student emails:", result.reason);
        return [];
      });

      if (entries.length === 0) {
        return;
      }

      setStudentEmails((prev) => {
        const next = { ...prev };
        entries.forEach(([studentId, email]) => {
          next[studentId] = email;
        });
        return next;
      });
    };

    loadStudentEmails();
  }, [missingUserIds, usersRepository]);

  return { studentEmails };
};
