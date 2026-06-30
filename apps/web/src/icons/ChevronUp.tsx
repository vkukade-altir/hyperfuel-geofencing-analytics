import { SvgIcon, type SvgIconProps } from "@mui/material";

/** Matches `/Users/vkukade/Documents/Icons/output/chevron-up.svg` (stroke → currentColor). */
export const ChevronUp = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill="none"
      d="M6 15L12 9L18 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
