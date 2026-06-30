import { SvgIcon, type SvgIconProps } from "@mui/material";

/** Stroke chevron; `fill="none"` on root + path so MUI SvgIcon does not paint a solid triangle. */
export const ChevronRight = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill="none"
      d="M10 6L16 12L10 18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
