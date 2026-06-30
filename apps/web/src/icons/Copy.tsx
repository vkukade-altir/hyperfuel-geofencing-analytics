import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Copy = (props: SvgIconProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="none"
        d="M16.167 8h0c1.707 0 2.561 0 3.242.256a4 4 0 0 1 2.335 2.335c.256.681.256 1.535.256 3.242V15.6c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C18.96 22 17.84 22 15.6 22h-1.767c-1.708 0-2.561 0-3.242-.256a4 4 0 0 1-2.335-2.335C8 18.728 8 17.874 8 16.167h0M8.4 16h1.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C16 12.96 16 11.84 16 9.6V8.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C12.96 2 11.84 2 9.6 2H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C2 5.04 2 6.16 2 8.4v1.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C5.04 16 6.16 16 8.4 16z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
