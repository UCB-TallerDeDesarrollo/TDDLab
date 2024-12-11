import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Bubble } from "react-chartjs-2";
import FileUploadDialog from "../../Assignments/components/FileUploadDialog";

interface CommitTimelineDialogProps {
  open: boolean;
  handleCloseModal: () => void;
  handleOpenFileDialog: () => void;
  handleCloseFileDialog: () => void;
  handleFileUpload: (file: File) => Promise<void>;
  isFileDialogOpen: boolean;
  selectedCommit: any;
  commitTimelineData: any[];
  commits: any[];
}

