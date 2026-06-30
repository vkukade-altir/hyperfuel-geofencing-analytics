import { forwardRef } from 'react';

import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Warning = forwardRef<SVGSVGElement, SvgIconProps>((props: SvgIconProps, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path
      d="M21.672 17.396 14.027 4.18a2.331 2.331 0 0 0-4.054 0L2.328 17.397C1.406 18.99 2.536 21 4.355 21h15.29c1.819 0 2.949-2.01 2.027-3.604Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path fillRule="evenodd" clipRule="evenodd" d="M12 16h.009H12Z" fill="currentColor" />
    <path
      d="M12 16h.009"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 9v4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
));
