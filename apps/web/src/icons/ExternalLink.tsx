import { SvgIcon, type SvgIconProps } from '@mui/material';

export const ExternalLink = (props: SvgIconProps) => {
  return (
    <SvgIcon xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M8 1h-.5l-2.7.1a5 5 0 0 0-3.7 3.7L1 7.5V11c0 2.8 0 4.2.5 5.3a5 5 0 0 0 2.2 2.2c1.1.5 2.5.5 5.3.5h3.5l2.7-.1a5 5 0 0 0 3.7-3.7l.1-2.7V12m-9-2 9-9m0 0h-6m6 0v6"
      />
    </SvgIcon>
  );
};
