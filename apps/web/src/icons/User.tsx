import { SvgIcon, type SvgIconProps } from '@mui/material';

import { ActiveAwareSvgIcon } from './primitives/ActiveAwareSvgIcon';

export const User = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 48 48" {...props}>
    <path
      d="M8 37.6C8 32.2981 12.2981 28 17.6 28H30.4C35.7019 28 40 32.2981 40 37.6V37.6C40 41.1346 37.1346 44 33.6 44H14.4C10.8654 44 8 41.1346 8 37.6V37.6Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 12C32 16.4183 28.4183 20 24 20C19.5817 20 16 16.4183 16 12C16 7.58172 19.5817 4 24 4C28.4183 4 32 7.58172 32 12Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);

export const UserActiveAware = (props: SvgIconProps) => (
  <ActiveAwareSvgIcon viewBox="0 0 48 48" {...props}>
    <path
      className="iconEmpty"
      d="M8 37.6C8 32.2981 12.2981 28 17.6 28H30.4C35.7019 28 40 32.2981 40 37.6V37.6C40 41.1346 37.1346 44 33.6 44H14.4C10.8654 44 8 41.1346 8 37.6V37.6Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      className="iconEmpty"
      d="M32 12C32 16.4183 28.4183 20 24 20C19.5817 20 16 16.4183 16 12C16 7.58172 19.5817 4 24 4C28.4183 4 32 7.58172 32 12Z"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      className="iconFilled"
      d="M24 4C19.5817 4 16 7.58172 16 12C16 16.4183 19.5817 20 24 20C28.4183 20 32 16.4183 32 12C32 7.58172 28.4183 4 24 4Z"
      fill="currentColor"
    />
    <path
      className="iconFilled"
      d="M14.4 28C10.8654 28 8 30.8654 8 34.4V37.6C8 42.9019 12.2981 47.2 17.6 47.2H30.4C35.7019 47.2 40 42.9019 40 37.6V34.4C40 30.8654 37.1346 28 33.6 28H14.4Z"
      fill="currentColor"
    />
  </ActiveAwareSvgIcon>
);
