import { useId } from 'react';

import { SvgIcon, type SvgIconProps } from '@mui/material';

export const AddContact = (props: SvgIconProps) => {
  const maskId = useId();

  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <defs>
        <mask id={maskId}>
          <rect width="20" height="20" fill="white" />
          {/* Cut out the plus area */}
          <circle cx="18" cy="18" r="5" fill="black" />
        </mask>
      </defs>

      {/* Contact icon with mask */}
      <g mask={`url(#${maskId})`}>
        <path
          d="M15 10a4 4 0 0 0 0-8m2 20h2.8a3.2 3.2 0 0 0 3.2-3.2v0a4.8 4.8 0 0 0-4.8-4.8H17m-5-8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4.2 22h7.6a3.2 3.2 0 0 0 3.2-3.2v0a4.8 4.8 0 0 0-4.8-4.8H5.8A4.8 4.8 0 0 0 1 18.8v0A3.2 3.2 0 0 0 4.2 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Plus icon at bottom right - scaled down */}
      <g transform="translate(12, 12) scale(0.6)">
        <path
          d="M5 12H12M19 12H12M12 12V5M12 12V19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </SvgIcon>
  );
};
