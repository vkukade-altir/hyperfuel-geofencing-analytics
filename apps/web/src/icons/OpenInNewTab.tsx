import { SvgIcon, type SvgIconProps } from '@mui/material';

export const OpenInNewTab = (props: SvgIconProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13 4h-3c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 6.73C2 7.8 2 9.2 2 12v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 22 7.2 22 10 22h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C20 18.2 20 16.8 20 14v-3m-8 1L22 2m0 0h-5m5 0v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
