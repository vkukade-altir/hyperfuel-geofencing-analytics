import { SvgIcon, type SvgIconProps } from '@mui/material';

/**
 * Filled heart — same geometry as `Icons/output/heart.svg`, filled (no separate asset in output).
 */
export const HeartFilled = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M12 21C13 21 22 16.0002 22 9.00043C22 5.50057 19 3.04405 16 3.00065C14.5 2.97894 13 3.50065 12 5.00059C11 3.50065 9.47405 3.00065 8 3.00065C5 3.00065 2 5.50057 2 9.00043C2 16.0002 11 21 12 21Z"
      fill="currentColor"
    />
  </SvgIcon>
);
