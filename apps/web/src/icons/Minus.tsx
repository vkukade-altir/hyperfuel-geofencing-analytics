import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Minus = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M5 12H12M19 12H12M12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
