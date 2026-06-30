import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Plus = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M5 12H12M19 12H12M12 12V5M12 12V19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
