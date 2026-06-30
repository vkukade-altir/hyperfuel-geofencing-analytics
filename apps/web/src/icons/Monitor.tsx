import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Monitor = (props: SvgIconProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14 18c0 4 2 4 2 4m0 0h1m-1 0H8m-1 0h1m-6-9v.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 18 5.12 18 6.8 18H10m-8-5V6.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C4.28 2 5.12 2 6.8 2h10.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C22 4.28 22 5.12 22 6.8V13M2 13h20m0 0v.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C19.72 18 18.88 18 17.2 18H10m-2 4s2-.5 2-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
