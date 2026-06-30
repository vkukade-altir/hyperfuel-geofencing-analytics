import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Comment = (props: SvgIconProps) => {
  return (
    <SvgIcon
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12.5 16a.5.5 0 0 1-1 0m1 0a.5.5 0 0 0-1 0m1 0h-1M10 10.5V10c0-1.1046.8954-2 2-2s2 .8954 2 2v.1213a2.1214 2.1214 0 0 1-.6213 1.5L12 13m10-1c0 5.5228-4.4772 10-10 10-1.1394 0-2.1165-.1623-3.0237-.4868-.8575-.3067-1.2863-.4601-1.4508-.4988-1.5179-.357-2.1476.6833-3.4558.9013-.6426.1071-1.2144-.419-1.161-1.0682.0466-.5677.4392-1.1046.5958-1.6498.3257-1.1333-.1162-1.9925-.5831-3.0004C2.3301 14.921 2 13.499 2 12 2 6.4771 6.4771 2 12 2c5.5228 0 10 4.4771 10 10Z"
      />
    </SvgIcon>
  );
};
