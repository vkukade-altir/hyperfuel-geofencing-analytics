import { type SvgIconProps, SvgIcon } from "@mui/material";

export const ChevronsDown = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill="none"
      d="m16 7-4 4-4-4m-4 3 8 8 8-8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
