import { SvgIcon, type SvgIconProps } from "@mui/material";

/** Matches `/Users/vkukade/Documents/Icons/output/chevrons-left.svg` (stroke → currentColor). */
export const ChevronsLeft = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill="none"
      d="M13 4L5 12L13 20M16 8L12 12L16 16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
