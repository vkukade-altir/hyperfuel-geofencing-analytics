import { type SvgIconProps, SvgIcon } from '@mui/material';

export const CrossCircle = (props: SvgIconProps) => (
  <SvgIcon width="24" height="24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M2.75 12c0-5.1086 4.1414-9.25 9.25-9.25s9.25 4.1414 9.25 9.25-4.1414 9.25-9.25 9.25S2.75 17.1086 2.75 12ZM12 1.25C6.063 1.25 1.25 6.063 1.25 12c0 5.9371 4.813 10.75 10.75 10.75 5.9371 0 10.75-4.8129 10.75-10.75 0-5.937-4.8129-10.75-10.75-10.75ZM9.5303 8.4697a.75.75 0 0 0-1.0606 1.0606L10.9393 12l-2.4696 2.4697a.75.75 0 0 0 1.0607 1.0606L12 13.0607l2.4697 2.4696a.75.75 0 0 0 1.0606 0 .75.75 0 0 0 0-1.0606L13.0607 12l2.4696-2.4697a.75.75 0 0 0-1.0606-1.0606L12 10.9393 9.5303 8.4697Z"
      clipRule="evenodd"
    />
  </SvgIcon>
);
