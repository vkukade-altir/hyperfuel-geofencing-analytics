import { SvgIcon, type SvgIconProps } from '@mui/material';

import { ActiveAwareSvgIcon } from './primitives/ActiveAwareSvgIcon';

export const CheckCircle = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M8.5 12.5 11 15l5.5-5.5M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);

export const CheckCircleActiveAware = (props: SvgIconProps) => (
  <ActiveAwareSvgIcon {...props}>
    <path
      className="iconEmpty"
      d="M8.5 12.5L11 15L16.5 9.5M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      className="iconFilled"
      d="M12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12C1.25 6.06294 6.06294 1.25 12 1.25ZM17.0303 8.96973C16.7374 8.67683 16.2626 8.67683 15.9697 8.96973L11 13.9395L9.03027 11.9697C8.73738 11.6768 8.26262 11.6768 7.96973 11.9697C7.67683 12.2626 7.67683 12.7374 7.96973 13.0303L10.4697 15.5303C10.6104 15.6709 10.8011 15.75 11 15.75C11.1989 15.75 11.3896 15.6709 11.5303 15.5303L17.0303 10.0303C17.3232 9.73738 17.3232 9.26262 17.0303 8.96973Z"
      fill="currentColor"
    />
  </ActiveAwareSvgIcon>
);
