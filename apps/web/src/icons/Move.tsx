import { SvgIcon, type SvgIconProps } from '@mui/material';

export const Move = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 24 24" {...props}>
    <path
      d="M12 3v6M3 12h6M21 12h-6M12 21v-6.5M9 6l1.705-1.952C11.315 3.35 11.621 3 12 3c.38 0 .684.35 1.295 1.048L15 6M15 18l-1.705 1.952C12.685 20.65 12.379 21 12 21c-.38 0-.684-.35-1.295-1.048L9 18M18 9l1.952 1.705C20.65 11.315 21 11.621 21 12c0 .38-.35.684-1.048 1.295L18 15M6 15l-1.952-1.705C3.35 12.685 3 12.379 3 12c0-.38.35-.684 1.048-1.295L6 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);
