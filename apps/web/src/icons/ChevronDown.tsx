import { SvgIcon, type SvgIconProps } from "@mui/material";

/** Matches `/Users/vkukade/Documents/Icons/output/chevron-down.svg` (stroke → currentColor). */
export const ChevronDown = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill="none"
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
