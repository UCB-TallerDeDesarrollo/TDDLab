import React, { useEffect, useMemo, useState } from "react";
import { TableRow, TableCell, Button } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { formatDate } from "../../../utils/dateUtils";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";
import {
  getDisplayStatus,
  isStudent,
} from "../utils/assignmentDetailHelpers";

interface UseStudentSubmissionRowsOptions {
  submissions: SubmissionDataObject[];
  role: string;
  disableAdditionalGraphs: boolean;
  actionButtonStyle: React.CSSProperties;
  onRedirectAdmin: (
    link: string,
    fetchedSubmissions: SubmissionDataObject[],
    submissionId: number,
    url: string
  ) => void;
  onOpenAssistant: (repositoryLink: string) => void;
  rowSx?: SxProps<Theme>;
  cellAlign?: "center" | "left" | "right";
  labels?: {
    viewGraph?: string;
    assistant?: string;
    additionalGraphs?: string;
  };
}

export const useStudentSubmissionRows = (
  options: UseStudentSubmissionRowsOptions
) => {
  const {
    submissions,
    role,
    disableAdditionalGraphs,
    actionButtonStyle,
    onRedirectAdmin,
    onOpenAssistant,
    rowSx,
    cellAlign,
    labels,
  } = options;

  const usersRepository = useMemo(() => new UsersRepository(), []);
  const [studentRows, setStudentRows] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    const buildRows = async () => {
      const cellAlignProps = cellAlign ? { align: cellAlign } : {};
      const labelText = {
        viewGraph: "Ver",
        assistant: "Asistente",
        additionalGraphs: "Ver",
        ...labels,
      };

      const rows = await Promise.all(
        submissions.map(async (submission) => {
          let studentEmail = "";
          try {
            const student = await usersRepository.getUserById(
              submission.userid
            );
            studentEmail = student.email;
          } catch (error) {
            console.error("Error fetching student email:", error);
          }

          const formattedStartDate = formatDate(
            submission.start_date.toString()
          );
          const formattedEndDate = submission.end_date
            ? formatDate(submission.end_date.toString())
            : "N/A";

          return (
            <TableRow key={submission.id} sx={rowSx}>
              <TableCell {...cellAlignProps}>{studentEmail}</TableCell>
              <TableCell {...cellAlignProps}>
                {getDisplayStatus(submission.status)}
              </TableCell>
              <TableCell {...cellAlignProps}>
                <a
                  href={submission.repository_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {submission.repository_link}
                </a>
              </TableCell>
              <TableCell {...cellAlignProps}>{formattedStartDate}</TableCell>
              <TableCell {...cellAlignProps}>{formattedEndDate}</TableCell>
              <TableCell {...cellAlignProps}>
                {submission.comment || "N/A"}
              </TableCell>
              <TableCell {...cellAlignProps}>
                <Button
                  variant="contained"
                  disabled={submission.repository_link === ""}
                  onClick={() => {
                    localStorage.setItem("selectedMetric", "Dashboard");
                    onRedirectAdmin(
                      submission.repository_link,
                      submissions,
                      submission.id,
                      "/graph"
                    );
                  }}
                  color="primary"
                  style={actionButtonStyle}
                >
                  {labelText.viewGraph}
                </Button>
              </TableCell>

              <TableCell {...cellAlignProps}>
                <Button
                  variant="contained"
                  disabled={submission.repository_link === ""}
                  onClick={() => onOpenAssistant(submission.repository_link)}
                  color="primary"
                  style={actionButtonStyle}
                >
                  {labelText.assistant}
                </Button>
              </TableCell>
              {!isStudent(role) && (
                <TableCell {...cellAlignProps}>
                  <Button
                    variant="contained"
                    disabled={
                      submission.repository_link === "" ||
                      disableAdditionalGraphs
                    }
                    onClick={() => {
                      localStorage.setItem("selectedMetric", "Complejidad");
                      onRedirectAdmin(
                        submission.repository_link,
                        submissions,
                        submission.id,
                        "/aditionalgraph"
                      );
                    }}
                    color="primary"
                    style={{ ...actionButtonStyle, marginRight: "7px" }}
                  >
                    {labelText.additionalGraphs}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })
      );

      setStudentRows(rows);
    };

    buildRows();
  }, [
    submissions,
    role,
    disableAdditionalGraphs,
    actionButtonStyle,
    onRedirectAdmin,
    onOpenAssistant,
    rowSx,
    cellAlign,
    labels,
    usersRepository,
  ]);

  return studentRows;
};
