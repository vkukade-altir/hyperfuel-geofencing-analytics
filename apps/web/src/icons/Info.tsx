import { forwardRef } from 'react';

import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Info = forwardRef<SVGSVGElement, SvgIconProps>((props: SvgIconProps, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path
      d="M12 16v-5m.5-3a.5.5 0 0 1-1 0m1 0a.5.5 0 0 0-1 0m1 0h-1M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
));
