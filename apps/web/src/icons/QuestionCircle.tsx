import { SvgIcon, type SvgIconProps } from '@mui/material';

export const QuestionCircle = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M10 10.5V10a2 2 0 1 1 4 0v.121c0 .563-.223 1.102-.621 1.5L12 13m.5 3a.5.5 0 0 1-1 0m1 0a.5.5 0 0 0-1 0m1 0h-1M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);
