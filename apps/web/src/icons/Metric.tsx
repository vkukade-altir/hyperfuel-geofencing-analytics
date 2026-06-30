import { useId } from 'react';

import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Metric = (props: SvgIconProps) => {
  const id = useId();

  return (
    <SvgIcon viewBox="0 0 24 10" {...props}>
      <path d="M0 6.5C2.5 6.5 4 4 6.5 4C9 4 11 6.5 15 6.5C19 6.5 21 2 25 2" stroke="currentColor" />
      <path
        d="M6.5 4C4 4 2.5 6.5 0 6.5V11H25V2C21 2 19 6.5 15 6.5C11 6.5 9 4 6.5 4Z"
        fill={`url(#${id}-paint0_linear)`}
      />
      <rect x="3.5" y="0.5" width="7" height="7" rx="3.5" fill="white" stroke="currentColor" />
      <defs>
        <linearGradient
          id={`${id}-paint0_linear`}
          x1="12.5"
          y1="2"
          x2="12.5"
          y2="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.04" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
};
