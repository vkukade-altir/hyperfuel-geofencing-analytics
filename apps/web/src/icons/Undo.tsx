import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Undo = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M4.75 6.75h7.5a4.5 4.5 0 1 1 0 9h-2.5m-5-9 2-2m-2 2 2 2m2 12h4c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185c.545-1.07.545-2.47.545-5.27v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C16.95.75 15.55.75 12.75.75h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 1.295 3.48C.75 4.55.75 5.95.75 8.75v4c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185c1.07.545 2.47.545 5.27.545Z"
    />
  </SvgIcon>
);
