import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Stop = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <rect
      width="20"
      height="20"
      x="2"
      y="2"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      rx="6"
    />
  </SvgIcon>
);
