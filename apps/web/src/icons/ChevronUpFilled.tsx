import { SvgIcon, type SvgIconProps } from '@mui/material';

export const ChevronUpFilled = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.47 8.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1-.53 1.28H6a.75.75 0 0 1-.53-1.28l6-6Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
};
