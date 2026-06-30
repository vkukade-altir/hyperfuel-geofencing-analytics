import { type SvgIconProps, SvgIcon } from '@mui/material';

export const Flag = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" {...props}>
    <path
      d="M5 4v11M5 4V2m0 2 1.32-.33a6.67 6.67 0 0 1 5.05.752 6.67 6.67 0 0 0 5.54.608L20 4v11l-3.09 1.03a6.67 6.67 0 0 1-5.54-.609 6.67 6.67 0 0 0-5.05-.75L5 15m0 7v-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
