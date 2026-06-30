import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Clock = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M12 8v4l3 2m-3 8C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);
