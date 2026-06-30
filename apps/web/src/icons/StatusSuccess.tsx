import { forwardRef } from 'react';

import { SvgIcon, type SvgIconProps } from '@mui/material';

export const StatusSuccess = forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
  <SvgIcon ref={ref} viewBox="0 0 45 40" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M38 20a18 18 0 1 1-4.61-12.03l1.5-1.32A20 20 0 1 0 39 13.7l-1.65 1.45c.43 1.54.66 3.17.66 4.85Z"
      fill="currentColor"
    />
    <path d="m11 20 7.5 7.5 25-23" stroke="currentColor" strokeWidth="2" />
  </SvgIcon>
));
