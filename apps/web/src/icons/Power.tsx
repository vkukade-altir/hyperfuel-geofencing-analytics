import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Power = (props: SvgIconProps) => {
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
        strokeWidth="1.5"
        d="M12 2v10m4-7.0644C18.9634 6.4082 21 9.4663 21 13c0 4.9706-4.0294 9-9 9s-9-4.0294-9-9c0-3.5337 2.0366-6.5918 5-8.0645"
      />
    </SvgIcon>
  );
};
