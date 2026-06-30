import { type SvgIconProps, SvgIcon } from '@mui/material';

export const Bell = (props: SvgIconProps) => (
  <SvgIcon xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M8 19.546C8.659 21.027 10.378 22 12 22c1.622 0 3.341-.973 4-2.454m2-8.356V8a6 6 0 0 0-6-6v0a6 6 0 0 0-6 6v3.19c0 .834-.354 1.629-.974 2.186l-1.107.997c-1.323 1.19-.901 3.36.771 3.969l.211.077a20.773 20.773 0 0 0 14.198 0l.21-.077c1.673-.608 2.095-2.778.772-3.969l-1.107-.997A2.941 2.941 0 0 1 18 11.19Z"
    />
  </SvgIcon>
);
