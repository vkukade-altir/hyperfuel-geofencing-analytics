import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Maximize = (props: SvgIconProps) => {
  return (
    <SvgIcon viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M21 7V6.5V6.5C21 5.10444 21 4.40666 20.8278 3.83886C20.44 2.56046 19.4395 1.56004 18.1611 1.17224C17.5933 1 16.8956 1 15.5 1V1H15M21 15V15.5V15.5C21 16.8956 21 17.5933 20.8278 18.1611C20.44 19.4395 19.4395 20.44 18.1611 20.8278C17.5933 21 16.8956 21 15.5 21V21H15M1 15V15.5V15.5C1 16.8956 1 17.5933 1.17224 18.1611C1.56004 19.4395 2.56046 20.44 3.83886 20.8278C4.40666 21 5.10444 21 6.5 21V21H7M1 7V6.5V6.5C1 5.10444 1 4.40666 1.17224 3.83886C1.56004 2.56046 2.56046 1.56004 3.83886 1.17224C4.40666 1 5.10444 1 6.5 1V1H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
