import { SvgIcon, type SvgIconProps } from '@mui/material';

export const FitScreen = (props: SvgIconProps) => (
  <SvgIcon
    {...props}
    height="24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      d="M2 9V4H7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M17 4H22V9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M7 20H2V15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M22 15V20H17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <rect x="7" y="9" width="10" height="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </SvgIcon>
);
