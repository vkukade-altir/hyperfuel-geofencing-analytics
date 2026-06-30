import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Approval = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <path
        d="m18 18.5.278-1.386c.146-.733.538-1.41.678-2.144a2.5 2.5 0 1 0-4.912 0c.14.735.532 1.41.679 2.144L15 18.5m3 0h-3m3 0 2.497.666A1.92 1.92 0 0 1 22 21.04c0 .53-.43.96-.96.96H11.96a.96.96 0 0 1-.96-.96c0-.9.625-1.679 1.503-1.874L15 18.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M17 9V8c0-2.828 0-4.243-.879-5.121C15.243 2 13.828 2 11 2H8c-2.828 0-4.243 0-5.121.879C2 3.757 2 5.172 2 8v8c0 2.828 0 4.243.879 5.121C3.757 22 5.172 22 8 22"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M7 8.667s.625 0 1.25 1.333c0 0 1.985-3.333 3.75-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path d="M6 14h4M6 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </SvgIcon>
  );
};
