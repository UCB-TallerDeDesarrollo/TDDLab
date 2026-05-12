import { Icon } from '@iconify/react';

interface AppIconProps {
  icon: string;
  className?: string;
  size?: number | string;
  color?: string;
  onClick?: (e: any) => void;
}

export const AppIcon = ({ icon, className = "", size = 20, color, onClick }: AppIconProps) => {
  return (
    <Icon 
      icon={icon} 
      width={size} 
      height={size} 
      className={`app-icon ${className}`} 
      style={{ color: color }}
      onClick={onClick}
    />
  );
};