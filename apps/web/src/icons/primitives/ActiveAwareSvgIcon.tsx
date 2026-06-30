import { SvgIcon, type SvgIconProps, styled } from '@mui/material';

const StyledSvgIcon = styled(SvgIcon)(({ theme }) => ({
  path: {
    transition: theme.transitions.create('opacity'),
  },

  '[data-isactive="false"] &': {
    'path.iconEmpty': {
      opacity: 1,
    },
    'path.iconFilled': {
      opacity: 0,
    },
  },
  '[data-isactive="true"] &': {
    'path.iconEmpty': {
      opacity: 0,
    },
    'path.iconFilled': {
      opacity: 1,
    },
  },
}));

export const ActiveAwareSvgIcon = (props: SvgIconProps) => <StyledSvgIcon {...props} />;
