import { type SvgIconProps, SvgIcon } from '@mui/material';

export const Calculator = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path
      d="M15 6h2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 13v-2c0-4.24 0-6.36-1.32-7.68C18.36 2 16.24 2 12 2S5.64 2 4.32 3.32C3 4.64 3 6.76 3 11v2c0 4.24 0 6.36 1.32 7.68C5.64 22 7.76 22 12 22s6.36 0 7.68-1.32C21 19.36 21 17.24 21 13Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M7 14h.53m4.2 0h.53m4.21 0H17M7 18h.53m4.2 0h.53m4.21 0H17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
