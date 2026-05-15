import React from 'react';
import { Icon, IconProps as IconifyIconProps } from '@iconify/react';
import { Box, BoxProps } from '@mui/material';

type AnimationType = 'scale' | 'rotate' | 'bounce' | 'pulse' | 'glow' | 'shake' | 'flip' | 'none';


interface IconifyIconComponentProps extends BoxProps {
  icon: string;
  width?: string | number;
  height?: string | number;
  
  color?: string;
  
  hoverColor?: string;
  
  rotate?: 0 | 1 | 2 | 3 | 90 | 180 | 270;
  
  flip?: 'horizontal' | 'vertical';
  
  animation?: AnimationType;
  
  animationSpeed?: number;
  iconifyProps?: Partial<IconifyIconProps>;
}


const IconifyIcon = React.forwardRef<HTMLDivElement, IconifyIconComponentProps>(
  (
    {
      icon,
      width = 24,
      height = 24,
      color = 'currentColor',
      hoverColor = 'primary',
      rotate,
      flip,
      animation = 'scale',
      animationSpeed = 300,
      iconifyProps = {},
      sx = {},
      ...boxProps
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    // Determinar el color actual basado en hover
    const currentColor = isHovered && hoverColor ? hoverColor : color;

    // Estilos de animaciones con transición de color incluida en todas
    const animationStyles = {
      scale: {
        transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        transition: `transform ${animationSpeed}ms cubic-bezier(0.34, 1.56, 0.64, 1), color ${animationSpeed}ms ease-in-out`,
      },
      rotate: {
        transform: isHovered ? 'rotate(20deg)' : 'rotate(0deg)',
        transition: `transform ${animationSpeed}ms ease-in-out, color ${animationSpeed}ms ease-in-out`,
      },
      bounce: {
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: `transform ${animationSpeed}ms cubic-bezier(0.34, 1.56, 0.64, 1), color ${animationSpeed}ms ease-in-out`,
      },
      pulse: {
        opacity: isHovered ? 0.7 : 1,
        transition: `opacity ${animationSpeed}ms ease-in-out, color ${animationSpeed}ms ease-in-out`,
      },
      glow: {
        filter: isHovered ? 'drop-shadow(0 0 8px currentColor)' : 'drop-shadow(0 0 0px transparent)',
        transition: `filter ${animationSpeed}ms ease-in-out, color ${animationSpeed}ms ease-in-out`,
      },
      shake: {
        transform: isHovered ? 'skewX(-2deg)' : 'skewX(0deg)',
        transition: `transform ${animationSpeed}ms ease-in-out, color ${animationSpeed}ms ease-in-out`,
      },
      flip: {
        transform: isHovered ? 'scaleX(-1)' : 'scaleX(1)',
        transition: `transform ${animationSpeed}ms ease-in-out, color ${animationSpeed}ms ease-in-out`,
      },
      none: {
        transition: `color ${animationSpeed}ms ease-in-out`,
      },
    };

    const defaultSx: React.CSSProperties & { transition?: string } = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      userSelect: 'none',
      color: currentColor,
      ...(animation && animation !== 'none' ? animationStyles[animation] : animationStyles.none),
    };

    const combinedSx = typeof sx === 'object' 
      ? { ...defaultSx, ...sx }
      : defaultSx;

    return (
      <Box
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={combinedSx as any}
        {...boxProps}
      >
        <Icon
          icon={icon}
          width={width}
          height={height}
          rotate={rotate}
          flip={flip}
          {...iconifyProps}
        />
      </Box>
    );
  }
);

IconifyIcon.displayName = 'IconifyIcon';

export default IconifyIcon;

