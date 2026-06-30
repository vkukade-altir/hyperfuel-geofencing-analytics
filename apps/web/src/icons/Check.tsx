import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Check = (props: SvgIconProps) => (
  <SvgIcon width={24} height={24} {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M19.69 5.777a1 1 0 0 1 .033 1.413l-10.5 11a1 1 0 0 1-1.43.017l-3.5-3.5a1 1 0 1 1 1.414-1.414l2.776 2.776 9.794-10.26a1 1 0 0 1 1.413-.032Z"
      clipRule="evenodd"
    />
  </SvgIcon>
);
