import { type SvgIconProps, SvgIcon } from '@mui/material';

export const Menu = (props: SvgIconProps) => (
  <SvgIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M4 5h16M4 12h16M4 19h16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
