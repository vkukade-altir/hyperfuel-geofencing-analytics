import { SvgIcon, type SvgIconProps } from "@mui/material";

/** Matches `/Users/vkukade/Documents/Icons/output/chevrons-right.svg` (stroke → currentColor). */
export const ChevronsRight = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill="none"
      d="M11 4L19 12L11 20M8 8L12 12L8 16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
