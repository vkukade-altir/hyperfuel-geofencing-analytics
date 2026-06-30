import { SvgIcon, type SvgIconProps } from '@mui/material';

export const MinViewFilled = (props: SvgIconProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        stroke="currentColor"
        fill="var(--icon-max-view-fill)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M2 3v18M22 3v18m-10.2-1h.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C17 17.72 17 16.88 17 15.2V8.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C14.72 4 13.88 4 12.2 4h-.4c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C7 6.28 7 7.12 7 8.8v6.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C9.28 20 10.12 20 11.8 20Z"
      />
    </SvgIcon>
  );
};
