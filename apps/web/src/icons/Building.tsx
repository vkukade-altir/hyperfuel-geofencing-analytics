import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Building = (props: SvgIconProps) => {
  return (
    <SvgIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" {...props}>
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m15 9 2.1494.6448c1.3732.412 2.0598.618 2.4552 1.1494S20 12.0425 20 13.4761V21"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M7 8h3m-3 4h3"
      />
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M11 21v-3c0-.9428 0-1.4142-.2929-1.7071C10.4142 16 9.9428 16 9 16H8c-.9428 0-1.4142 0-1.7071.2929C6 16.5858 6 17.0572 6 18v3"
      />
      <path stroke="currentColor" d="M1 21h20" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M2 21V5.7172c0-2.5107 0-3.766.7912-4.389.7912-.6228 1.9562-.2847 4.2863.3917l5 1.4513c1.4061.4082 2.1092.6122 2.5158 1.1684C15 4.896 15 5.6534 15 7.1686V21"
      />
    </SvgIcon>
  );
};
