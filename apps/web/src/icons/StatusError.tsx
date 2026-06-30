import { forwardRef } from 'react';

import { SvgIcon, type SvgIconProps } from '@mui/material';

export const StatusError = forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
  <SvgIcon ref={ref} viewBox="0 0 41 40" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M38 20a18 18 0 1 1-7.9-14.9l1.44-1.44a20 20 0 1 0 5.48 5.83l-1.46 1.46A17.9 17.9 0 0 1 38 20Z"
      fill="currentColor"
    />
    <path d="m11.02 12.02 18.03 18.03M11.02 30.05l29-29" stroke="currentColor" />
  </SvgIcon>
));
