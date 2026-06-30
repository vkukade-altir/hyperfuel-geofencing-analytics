import { SvgIcon, type SvgIconProps } from '@mui/material';

export const ArrowSwap = (props: SvgIconProps) => {
  return (
    <SvgIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M6 2 2 6m0 0 4 4M2 6h14m2 8 4 4m0 0-4 4m4-4H8"
      />
    </SvgIcon>
  );
};
