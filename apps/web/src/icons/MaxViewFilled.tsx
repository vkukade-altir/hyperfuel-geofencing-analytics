import { SvgIcon, type SvgIconProps } from '@mui/material';

export const MaxViewFilled = (props: SvgIconProps) => {
  return (
    <SvgIcon viewBox="-2 -2 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect
        width="18.5"
        height="18.5"
        x=".75"
        y=".75"
        stroke="currentColor"
        fill="var(--icon-max-view-fill)"
        strokeWidth="1.5"
        rx="5.25"
      />
    </SvgIcon>
  );
};
