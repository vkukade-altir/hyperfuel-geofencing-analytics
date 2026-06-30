import { type SvgIconProps, SvgIcon } from '@mui/material';

export const AlertTriangle = (props: SvgIconProps) => (
  <SvgIcon
    width="28"
    height="26"
    viewBox="0 0 28 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M14 15v-4m.5 7.5a.5.5 0 0 1-1 0m1 0a.5.5 0 0 0-1 0m1 0h-1m11.832.736-8.54-15.25c-.913-1.63-1.369-2.444-1.969-2.716a2 2 0 0 0-1.646 0c-.6.272-1.056 1.086-1.969 2.716l-8.54 15.25c-.878 1.567-1.316 2.35-1.243 2.991a2 2 0 0 0 .818 1.396C2.767 24 3.664 24 5.46 24h17.08c1.796 0 2.693 0 3.217-.377a2 2 0 0 0 .818-1.396c.073-.641-.365-1.424-1.243-2.99Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);
