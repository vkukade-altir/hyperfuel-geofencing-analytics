import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Minimize = (props: SvgIconProps) => {
  return (
    <SvgIcon viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7 1v2.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C5.48 7 4.92 7 3.8 7H1m6 14v-2.8c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C5.48 15 4.92 15 3.8 15H1M15 1v2.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C16.52 7 17.08 7 18.2 7H21m-6 14v-2.8c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C16.52 15 17.08 15 18.2 15H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
