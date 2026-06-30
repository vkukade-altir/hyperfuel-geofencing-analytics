import { SvgIcon, type SvgIconProps } from '@mui/material';

export const TargetIcon = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      d="M15.131 2.5A10 10 0 0 0 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10a10 10 0 0 0-.458-3"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M17 12a5 5 0 1 1-5-5m7.5-2.5L12 12m7.5-7.5V2m0 2.5H22"
    />
  </SvgIcon>
);
