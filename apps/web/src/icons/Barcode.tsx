import { type SvgIconProps, SvgIcon } from '@mui/material';

export const Barcode = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M3 4v16M7.5 4v13M12 4v13M16.5 4v13M21 4v16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 20h.009M12 20h.009M16.5 20h.009"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
