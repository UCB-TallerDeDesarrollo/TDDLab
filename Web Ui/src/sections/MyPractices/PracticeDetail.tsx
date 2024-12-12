import React, { useEffect, useState } from "react";
import { formatDate } from "../../utils/dateUtils";
import { useParams, createSearchParams, useNavigate } from "react-router-dom";
import PracticesRepository from "../../modules/Practices/repository/PracticesRepository.ts";
import FileUploadDialog from "../Assignments/components/FileUploadDialog.tsx";
import JSZip from "jszip";
import CryptoJS from "crypto-js";
import { VITE_API } from "../../../config.ts";
import {
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import {
  AccessTime as AccessTimeIcon,
  Link as LinkIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { GitLinkDialog } from "../Assignments/components/GitHubLinkDialog.tsx";
import { CommentDialog } from "../Assignments/components/CommentDialog.tsx";
import CircularProgress from "@mui/material/CircularProgress";
import PracticeSubmissionRepository from "../../modules/PracticeSubmissions/Repository/PracticeSubmissionRepository.ts";
import { CreatePracticeSubmission } from "../../modules/PracticeSubmissions/Application/CreatePracticeSubmission.ts";
import {
  PracticeSubmissionCreationObject,
  PracticeSubmissionDataObject,
  PracticeSubmissionUpdateObject,
} from "../../modules/PracticeSubmissions/Domain/PracticeSubmissionInterface.ts";
import { CheckPracticeSubmissionExists } from "../../modules/PracticeSubmissions/Application/CheckPracticeSubmissionExists.ts";
import { GetPracticeSubmissionsByPracticeId } from "../../modules/PracticeSubmissions/Application/getPracticeSubmissionByPracticeId.ts";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { FinishPracticeSubmission } from "../../modules/PracticeSubmissions/Application/FinishPracticeSubmission.ts";
import { GetPracticeSubmissionByUserandPracticeSubmissionId } from "../../modules/PracticeSubmissions/Application/getPracticeSubmissionByUserIdAnPracticeSubmissionId.ts";

import { GetPracticeById } from "../../modules/Practices/application/GetPracticeById.ts";
interface PracticeDetailProps {
  title: string;
  userid: number;
}

function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomChars = Math.random().toString(36).substring(2, 8);
  return timestamp + randomChars;
}

const PracticeDetail: React.FC<PracticeDetailProps> = ({ userid }) => {
  const [practice, setPractice] = useState<PracticeDetailProps | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { id } = useParams();
  const practiceid = Number(id);
  const [submissionStatus, setSubmissionStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const [loadingSubmissions, setLoadingPracticeSubmissions] = useState(true);
  const [practiceSubmissions, setPracticeSubmissions] = useState<
    PracticeSubmissionDataObject[]
  >([]);
  const [studentSubmission, setStudentSubmission] =
    useState<PracticeSubmissionDataObject>();
  const [_submissionsError, setSubmissionsError] = useState<string | null>(
    null
  );
  const [studentRows, setStudentRows] = useState<JSX.Element[]>([]);
  const [submission, setPracticeSubmission] =
    useState<PracticeSubmissionDataObject | null>(null);
  const navigate = useNavigate();
  const usersRepository = new UsersRepository();

  useEffect(() => {
    const practiceSubmissionRepository = new PracticeSubmissionRepository();
    const practiceSubmissionData =
      new GetPracticeSubmissionByUserandPracticeSubmissionId(
        practiceSubmissionRepository
      );
    practiceSubmissionData
      .getPracticeSubmisssionByUserandPracticeSubmissionId(practiceid, userid)
      .then((fetchedPracticeSubmission) => {
        setPracticeSubmission(fetchedPracticeSubmission);
      })
      .catch((error) => {
        console.error("Error fetching submission:", error);
      });
  }, [practiceid, userid]);

  useEffect(() => {
    const practiceRepository = new PracticesRepository();
    const getPracticeDetail = new GetPracticeById(practiceRepository);

    getPracticeDetail
      .obtainAssignmentDetail(practiceid)
      .then((fetchedPractice) => {
        if (fetchedPractice) {
          setPractice({
            ...fetchedPractice,
            userid: fetchedPractice.userid ?? 0, // Usa un valor predeterminado si `userid` es undefined
          });
        } else {
          setPractice(null); // Maneja el caso de datos nulos
        }
      })
      .catch((error) => {
        console.error("Error fetching practice:", error);
      });
  }, [practiceid]);

  useEffect(() => {
    const checkIfStarted = async () => {
      if (userid && userid !== -1) {
        try {
          console.log("the user id is ", userid);
          const practiceSubmissionRepository =
            new PracticeSubmissionRepository();
          const checkPracticeSubmissionExists =
            new CheckPracticeSubmissionExists(practiceSubmissionRepository);
          const response =
            await checkPracticeSubmissionExists.checkPracticeSubmissionExists(
              practiceid,
              userid
            );
          console.log("The response is ", response);
          setSubmissionStatus((prevStatus) => ({
            ...prevStatus,
            [userid]: !!response,
          }));
        } catch (error) {
          console.error("Error checking submission status:", error);
        }
      }
    };

    checkIfStarted();
  }, [practiceid, userid]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const practiceSubmissionRepository = new PracticeSubmissionRepository();
        const getPracticeSubmissionsByAssignmentId =
          new GetPracticeSubmissionsByPracticeId(practiceSubmissionRepository);
        const fetchedSubmissions =
          await getPracticeSubmissionsByAssignmentId.getPracticeSubmissionsByPracticeId(
            practiceid
          );
        setPracticeSubmissions(fetchedSubmissions);
        console.log("Lista de practice submissions: ", fetchedSubmissions);
      } catch (error) {
        setSubmissionsError(
          "Error fetching practice submissions. Please try again later."
        );
        console.error(
          "Error fetching PracticeSubmissionByPracticeAndUser:",
          error
        );
      } finally {
        setLoadingPracticeSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [practiceid]);

  useEffect(() => {
    renderStudentRows();
  }, [practiceSubmissions]);

  const isTaskInProgress = submission?.status !== "in progress";
  // useEffect(() => {
  //   const fetchStudentSubmission = async () => {
  //     if (isStudent(role)) {
  //       if (assignmentid && userid && userid !== -1) {
  //         try {
  //           const submissionRepository = new SubmissionRepository();
  //           const getSubmissionsByAssignmentId =
  //             new GetSubmissionsByAssignmentId(submissionRepository);
  //           const allSubmissions =
  //             await getSubmissionsByAssignmentId.getSubmissionsByAssignmentId(
  //               assignmentid
  //             );
  //           const userSubmission = allSubmissions.find(
  //             (submission) => submission.userid === userid
  //           );
  //           setSubmissionStatus((prevStatus) => ({
  //             ...prevStatus,
  //             [userid]: !!userSubmission,
  //           }));
  //           if (userSubmission) {
  //             setStudentSubmission(userSubmission);
  //           }
  //         } catch (error) {
  //           console.error("Error fetching student submission:", error);
  //         }
  //       }
  //     }
  //   };

  //   fetchStudentSubmission();
  // }, [assignmentid, userid, role]);

  const handleSendGithubLink = async (repository_link: string) => {
    console.log("I will print the json log"); //delete later
    if (practiceid) {
      const practiceSubmissionsRepository = new PracticeSubmissionRepository();
      const createSubmission = new CreatePracticeSubmission(
        practiceSubmissionsRepository
      );
      const startDate = new Date();
      const start_date = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const submissionData: PracticeSubmissionCreationObject = {
        practiceid: practiceid,
        userid: userid,
        status: "in progress",
        repository_link: repository_link,
        start_date: start_date,
      };
      try {
        await createSubmission.createSubmission(submissionData);
        handleCloseLinkDialog();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
    window.location.reload();
  };

  const handleRedirectStudent = (link: string) => {
    if (link) {
      const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
      const match = regex.exec(link);

      if (match) {
        const [, user, repo] = match;
        console.log(user, repo);
        navigate({
          pathname: "/graph",
          search: createSearchParams({
            repoOwner: user,
            repoName: repo,
          }).toString(),
        });
      } else {
        alert("Link Invalido, por favor ingrese un link valido.");
      }
    } else {
      alert("No se encontro un link para esta tarea.");
    }
  };

  const handleRedirectAdmin = (
    link: string,
    fetchedSubmissions: any[],
    submissionId: number
  ) => {
    if (link) {
      const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
      const match = regex.exec(link);

      if (match) {
        const [, user, repo] = match;
        console.log(user, repo);

        navigate({
          pathname: "/graph",
          search: createSearchParams({
            repoOwner: user,
            repoName: repo,
            fetchedSubmissions: JSON.stringify(fetchedSubmissions),
            submissionId: submissionId.toString(), // Convertimos submissionId a cadena para pasarlo como parámetro
          }).toString(),
        });
      } else {
        alert("Link Invalido, por favor ingrese un link valido.");
      }
    } else {
      alert("No se encontro un link para esta tarea.");
    }
  };

  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const [_comment, setComment] = useState("");

  const handleOpenCommentDialog = () => {
    setIsCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setIsCommentDialogOpen(false);
  };

  const handleOpenFileDialog = () => {
    setIsFileDialogOpen(true);
  };

  const handleCloseFileDialog = () => {
    setIsFileDialogOpen(false);
  };

  const handleUploadFile = async (file: File) => {
    try {
      console.log("Archivo recibido:", file);
      const reader = new FileReader();
      reader.onload = async () => {
        const encryptedContent = reader.result as string;
        const binaryData = decryptContent(
          encryptedContent,
          "iDHJp8o32$%u4drMjPLq8c!7S@wZEXWC"
        );
        const fileContent = await extractFileFromZip(
          binaryData,
          "tdd_log.json"
        );
        const jsonData = parseJSON(fileContent);
        const updatedData = enrichWithRepoData(
          jsonData,
          studentSubmission?.repository_link
        );
        console.log("JSON actualizado:", updatedData);

        const API_URL = `${VITE_API}/TDDCycles/upload-log`;

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
          console.log("Archivo subido exitosamente.");
          const responseData = await response.json();
          console.log("Respuesta de la API:", responseData);
        } else {
          console.error("Error al subir el archivo:", response.statusText);
          throw new Error(`Error en el POST: ${response.statusText}`);
        }

        return updatedData;
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      throw error;
    }
  };

  const decryptContent = (
    encryptedContent: string,
    decryptionKey: string
  ): Uint8Array => {
    const decryptedBytes = CryptoJS.AES.decrypt(
      encryptedContent,
      decryptionKey
    );
    const base64Data = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!base64Data) {
      throw new Error("Error al desencriptar");
    }

    const binaryString = atob(base64Data);
    const binaryData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }

    return binaryData;
  };

  const extractFileFromZip = async (
    binaryData: Uint8Array,
    targetFileName: string
  ): Promise<string> => {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(binaryData);
    const targetFile = loadedZip.file(targetFileName);
    if (!targetFile) {
      throw new Error(
        `El archivo ${targetFileName} no se encuentra en el ZIP.`
      );
    }
    return targetFile.async("string");
  };

  const parseJSON = (fileContent: string): any => {
    try {
      return JSON.parse(fileContent);
    } catch (error) {
      throw new Error("Error al parsear el JSON original.");
    }
  };

  const enrichWithRepoData = (jsonData: any, repoLink?: string) => {
    if (!repoLink) {
      throw new Error("No se encontró el enlace del repositorio.");
    }

    const repoMatch = repoLink.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
    if (!repoMatch) {
      throw new Error("El enlace del repositorio no es válido.");
    }

    const repoOwner = repoMatch[1];
    const repoName = repoMatch[2];

    return {
      repoName,
      repoOwner,
      log: jsonData,
    };
  };

  const handleSendComment = async (comment: string) => {
    if (submission) {
      setComment(comment);
      const submissionRepository = new PracticeSubmissionRepository();
      const finishSubmission = new FinishPracticeSubmission(
        submissionRepository
      );
      const endDate = new Date();
      const end_date = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      const submissionData: PracticeSubmissionUpdateObject = {
        id: submission?.id,
        status: "delivered",
        end_date: end_date,
        comment: comment,
      };
      try {
        await finishSubmission.finishSubmission(submission.id, submissionData);
        handleCloseLinkDialog();
      } catch (error) {
        console.error(error);
      }
    }
    handleCloseCommentDialog();
    window.location.reload();
  };

  const getDisplayStatus = (status: string | undefined) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in progress":
        return "En progreso";
      case "delivered":
        return "Enviado";
      case undefined:
        return "Pendiente";
      default:
        return status;
    }
  };

  const getStudentEmailById = async (studentId: number): Promise<string> => {
    try {
      const student = await usersRepository.getUserById(studentId);
      return student.email;
    } catch (error) {
      console.error("Error fetching student email:", error);
      return "";
    }
  };

  const renderStudentRows = async () => {
    const rows = await Promise.all(
      practiceSubmissions.map(async (practiceSubmission) => {
        const studentEmail = await getStudentEmailById(
          practiceSubmission.userid
        );
        const formattedStartDate = formatDate(
          practiceSubmission.start_date?.toString() || ""
        );

        const formattedEndDate = practiceSubmission.end_date
          ? formatDate(practiceSubmission.end_date.toString())
          : "N/A";

        return (
          <TableRow key={generateUniqueId()}>
            <TableCell>{studentEmail}</TableCell>
            <TableCell>{getDisplayStatus(practiceSubmission.status)}</TableCell>
            <TableCell>
              <a
                href={practiceSubmission.repository_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {practiceSubmission.repository_link}
              </a>
            </TableCell>
            <TableCell>{formattedStartDate}</TableCell>
            <TableCell>{formattedEndDate}</TableCell>
            <TableCell>{practiceSubmission.comment || "N/A"}</TableCell>
            <TableCell>
              <Button
                variant="contained"
                disabled={practiceSubmission.repository_link === ""}
                onClick={() => {
                  localStorage.setItem("selectedMetric", "Dashboard");
                  handleRedirectAdmin(
                    practiceSubmission.repository_link,
                    practiceSubmissions,
                    practiceSubmission.id
                  );
                }}
                color="primary"
                style={{
                  textTransform: "none",
                  fontSize: "15px",
                  marginRight: "8px",
                }}
              >
                Ver gráfica
              </Button>
            </TableCell>
          </TableRow>
        );
      })
    );

    setStudentRows(rows);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {practice ? (
        <Card variant="elevation" elevation={0}>
          <CardContent>
            <div style={{ marginBottom: "40px" }}>
              <Typography
                variant="h5"
                component="div"
                style={{ fontSize: "30px", lineHeight: "3.8" }}
              >
                {practice.title}
              </Typography>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <AccessTimeIcon
                  style={{ marginRight: "8px", color: "#666666" }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Estado:</strong>{" "}
                  {getDisplayStatus(studentSubmission?.status)}
                </Typography>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <LinkIcon style={{ marginRight: "8px", color: "#666666" }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Enlace:</strong>
                  <a
                    href={studentSubmission?.repository_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {studentSubmission?.repository_link}
                  </a>
                </Typography>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <CommentIcon style={{ marginRight: "8px", color: "#666666" }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={{ fontSize: "16px", lineHeight: "1.8" }}
                >
                  <strong>Comentario:</strong>{" "}
                  {studentSubmission?.repository_link === "" ||
                    studentSubmission == null}
                </Typography>
              </div>
            </div>

            <Button
              variant="contained"
              disabled={submissionStatus[userid.toString()] || false}
              onClick={handleOpenLinkDialog}
              style={{
                textTransform: "none",
                fontSize: "15px",
                marginRight: "8px",
              }}
            >
              Iniciar tarea
            </Button>

            <Button
              variant="contained"
              disabled={
                studentSubmission?.repository_link === "" ||
                studentSubmission == null
              }
              onClick={() => {
                localStorage.setItem("selectedMetric", "Dashboard");
                studentSubmission?.repository_link &&
                  handleRedirectStudent(studentSubmission.repository_link);
              }}
              color="primary"
              style={{
                textTransform: "none",
                fontSize: "15px",
                marginRight: "8px",
              }}
            >
              Ver gráfica
            </Button>

            <GitLinkDialog
              open={linkDialogOpen}
              onClose={handleCloseLinkDialog}
              onSend={handleSendGithubLink}
            />

            <Button
              variant="contained"
              disabled={isTaskInProgress}
              onClick={handleOpenCommentDialog}
              style={{
                textTransform: "none",
                fontSize: "15px",
                marginRight: "8px",
              }}
            >
              Finalizar tarea
            </Button>

            <Button
              variant="contained"
              disabled={isTaskInProgress}
              onClick={handleOpenFileDialog} // Abrir el nuevo diálogo
              style={{
                textTransform: "none",
                fontSize: "15px",
                marginRight: "8px",
              }}
            >
              Subir sesión TDD extension
            </Button>

            <CommentDialog
              open={isCommentDialogOpen}
              link={submission?.repository_link}
              onSend={handleSendComment}
              onClose={handleCloseCommentDialog}
            />
          </CardContent>
        </Card>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "250px",
          }}
        >
          <CircularProgress
            size={60}
            thickness={5}
            data-testid="loading-indicator"
          />
        </div>
      )}

      <FileUploadDialog
        open={isFileDialogOpen}
        onClose={handleCloseFileDialog}
        onUpload={handleUploadFile}
      />
    </div>
  );
};

export default PracticeDetail;
