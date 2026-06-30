import { type SvgIconProps, SvgIcon } from '@mui/material';

export const Event = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" {...props}>
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M8 1v3m8-3v3m1 4H7m10 9h-2m-3.4 5h.8c3.36 0 5.04 0 6.324-.654a6 6 0 0 0 2.622-2.622C22 17.44 22 15.76 22 12.4v-.8c0-3.36 0-5.04-.654-6.324a6 6 0 0 0-2.622-2.622C17.44 2 15.76 2 12.4 2h-.8c-3.36 0-5.04 0-6.324.654a6 6 0 0 0-2.622 2.622C2 6.56 2 8.24 2 11.6v.8c0 3.36 0 5.04.654 6.324a6 6 0 0 0 2.622 2.622C6.56 22 8.24 22 11.6 22Z"
    />
  </SvgIcon>
);
