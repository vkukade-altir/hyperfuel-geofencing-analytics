import { SvgIcon, type SvgIconProps } from '@mui/material';

export const UserCircle = (props: SvgIconProps) => {
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
        d="M22 12c0 5.5228-4.4772 10-10 10-5.5229 0-10-4.4772-10-10C2 6.4771 6.4771 2 12 2c5.5228 0 10 4.4771 10 10Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M14 8c0 1.1046-.8954 2-2 2s-2-.8954-2-2 .8954-2 2-2 2 .8954 2 2Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M13.6667 13H10.3333C8.49238 13 7 14.4924 7 16.3333C7 17.2538 7.74619 18 8.66667 18H15.3333C16.2538 18 17 17.2538 17 16.3333C17 14.4924 15.5076 13 13.6667 13Z"
      />
    </SvgIcon>
  );
};
