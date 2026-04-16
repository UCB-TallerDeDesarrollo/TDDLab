import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HelpIcon from "@mui/icons-material/Help";
import HomeIcon from "@mui/icons-material/Home";
import LanguageIcon from "@mui/icons-material/Language";
import LinkIcon from "@mui/icons-material/Link";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import SyncIcon from "@mui/icons-material/Sync";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningIcon from "@mui/icons-material/Warning";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import type { ComponentType, MouseEvent } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";

interface AppIconProps {
  icon: string;
  className?: string;
  size?: number | string;
  color?: string;
  onClick?: (e: MouseEvent<SVGSVGElement>) => void;
}

const iconMap: Record<string, ComponentType<SvgIconProps>> = {
  "ph:user-fill": AccountCircleIcon,
  "ph:magnifying-glass-bold": SearchIcon,
  "ph:warning-circle-fill": WarningIcon,
  "ph:x-bold": CloseIcon,
  "ph:check-bold": CheckIcon,
  "ph:users-three-fill": GroupsIcon,
  "ph:sign-out-bold": LogoutIcon,
  "ph:house-fill": HomeIcon,
  "ph:question-fill": HelpIcon,
  "ph:chart-bar-fill": BarChartIcon,
  "ph:globe-bold": LanguageIcon,
  "ph:plus-bold": AddIcon,
  "ph:gear-six-fill": SettingsIcon,
  "ph:cloud-arrow-up-bold": CloudUploadIcon,
  "ph:list-bold": MenuIcon,
  "ph:copy-bold": ContentCopyIcon,
  "ph:arrows-clockwise-bold": SyncIcon,
  "ph:arrow-u-up-left-bold": ChevronLeftIcon,
  "ph:code-bold": CodeIcon,
  "ph:floppy-disk-back-fill": SaveIcon,
  "ph:trash-bold": DeleteIcon,
  "ph:eye-bold": VisibilityIcon,
  "ph:pencil-simple-bold": EditIcon,
  "ph:chalkboard-teacher-fill": SchoolIcon,
  "ph:link-bold": LinkIcon,
};

export const AppIcon = ({ icon, className = "", size = 20, color, onClick }: AppIconProps) => {
  const IconComponent = iconMap[icon] ?? HelpIcon;

  return (
    <IconComponent
      sx={{ fontSize: size, color }}
      className={`app-icon ${className}`}
      style={{ color: color }}
      onClick={onClick}
    />
  );
};
