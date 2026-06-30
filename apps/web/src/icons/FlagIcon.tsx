import { type JSX } from 'react';

import { SvgIcon, type SvgIconProps } from '@mui/material';

export interface FlagIconProps extends SvgIconProps {
  isEnabled?: boolean;
}

export function FlagIcon({ isEnabled = false, sx, ...props }: FlagIconProps): JSX.Element {
  const resolvedSx = sx ?? { color: isEnabled ? 'text.primary' : 'text.secondary' };

  return (
    <SvgIcon sx={resolvedSx} {...props}>
      {isEnabled ? (
        <path
          d="M5 1.25a.75.75 0 0 1 .75.75v1.25H20l.097.006a.75.75 0 0 1 .574 1.079L19.1 7.474c-.543 1.087-.743 1.504-.823 1.926a3.254 3.254 0 0 0 0 1.2c.08.422.28.839.824 1.926l1.569 3.139A.75.75 0 0 1 20 16.75H5.75V22a.75.75 0 0 1-1.5 0V2A.75.75 0 0 1 5 1.25z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M5 4h15l-1.569 3.138c-.525 1.05-.787 1.574-.89 2.124a4.003 4.003 0 0 0 0 1.476c.103.55.365 1.075.89 2.124L20 16H5M5 4v12M5 4V2m0 20v-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </SvgIcon>
  );
}
