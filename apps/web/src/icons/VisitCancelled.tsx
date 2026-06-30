import { SvgIcon, type SvgIconProps } from '@mui/material';

export const VisitCancelled = (props: SvgIconProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8 1V4M16 1V4M9 15L12 12M12 12L15 9M12 12L9 9M12 12L15 15M8.4 22H15.6C17.8402 22 18.9603 22 19.816 21.564C20.5686 21.1805 21.1805 20.5686 21.564 19.816C22 18.9603 22 17.8402 22 15.6V8.4C22 6.15979 22 5.03968 21.564 4.18404C21.1805 3.43139 20.5686 2.81947 19.816 2.43597C18.9603 2 17.8402 2 15.6 2H8.4C6.15979 2 5.03968 2 4.18404 2.43597C3.43139 2.81947 2.81947 3.43139 2.43597 4.18404C2 5.03968 2 6.15979 2 8.4V15.6C2 17.8402 2 18.9603 2.43597 19.816C2.81947 20.5686 3.43139 21.1805 4.18404 21.564C5.03968 22 6.15979 22 8.4 22Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};
