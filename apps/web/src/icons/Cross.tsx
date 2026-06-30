import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Cross = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M6 18L18 6M6 6L18 18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
