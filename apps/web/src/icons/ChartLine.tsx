import { type SvgIconProps, SvgIcon } from '@mui/material';

export const ChartLine = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="m7 15 4-4 2 2 4-4m-7 13h4c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C22 18.2 22 16.8 22 14v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C18.2 2 16.8 2 14 2h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 4.73C2 5.8 2 7.2 2 10v4c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 22 7.2 22 10 22z"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
