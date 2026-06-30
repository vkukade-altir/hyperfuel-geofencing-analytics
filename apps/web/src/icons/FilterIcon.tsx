import { SvgIcon, type SvgIconProps } from '@mui/material';

export const FilterIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M3 6h18M6 12h12m-8 6h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </SvgIcon>
);
