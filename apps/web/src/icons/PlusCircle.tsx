import { SvgIcon, type SvgIconProps, styled } from '@mui/material';

export const PlusCircle = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path
      d="M8 12h4m0 0h4m-4 0V8m0 4v4m10-4c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);

const SvgIconWithHover = styled(SvgIcon)(({ theme }) => ({
  color: theme.palette.text.secondary,

  '.iconEmpty, .iconFilled': {
    transition: theme.transitions.create('opacity'),
    opacity: 0,
  },
  '.iconEmpty': {
    opacity: 1,
  },

  '&:hover, &:focus': {
    color: theme.palette.text.primary,

    '.iconEmpty': {
      opacity: 0,
    },

    '.iconFilled': {
      opacity: 1,
    },
  },
}));

export const PlusCircleFillOnHover = (props: SvgIconProps) => (
  <SvgIconWithHover {...props}>
    <path
      className="iconEmpty"
      d="M8 12H12M12 12L16 12M12 12V8M12 12L12 16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      className="iconFilled"
      d="M12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12C1.25 6.06294 6.06294 1.25 12 1.25ZM12 7.25C11.5858 7.25 11.25 7.58579 11.25 8V11.25H8C7.58579 11.25 7.25 11.5858 7.25 12C7.25 12.4142 7.58579 12.75 8 12.75H11.25V16C11.25 16.4142 11.5858 16.75 12 16.75C12.4142 16.75 12.75 16.4142 12.75 16V12.75H16C16.4142 12.75 16.75 12.4142 16.75 12C16.75 11.5858 16.4142 11.25 16 11.25H12.75V8C12.75 7.58579 12.4142 7.25 12 7.25Z"
      fill="currentColor"
    />
  </SvgIconWithHover>
);
