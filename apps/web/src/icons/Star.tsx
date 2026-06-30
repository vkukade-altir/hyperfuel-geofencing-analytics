import { SvgIcon, type SvgIconProps } from '@mui/material';

type TStarProps = SvgIconProps & { filled?: boolean };

export const Star = ({ filled, ...props }: TStarProps) => (
  <SvgIcon {...props}>
    <path
      d="M11.773 2.283a.25.25 0 0 1 .454 0l2.243 4.863a1.75 1.75 0 0 0 1.383 1.005l5.319.63a.25.25 0 0 1 .14.432L17.38 12.85a1.75 1.75 0 0 0-.528 1.626l1.043 5.253a.25.25 0 0 1-.367.267l-4.673-2.616a1.75 1.75 0 0 0-1.71 0l-4.673 2.616a.25.25 0 0 1-.367-.267l1.043-5.253a1.75 1.75 0 0 0-.528-1.626L2.688 9.213a.25.25 0 0 1 .14-.432l5.319-.63A1.75 1.75 0 0 0 9.53 7.146l2.243-4.863Z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </SvgIcon>
);
