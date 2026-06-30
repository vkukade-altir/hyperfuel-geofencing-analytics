import { type ReactElement, useState } from 'react';

import {
  Box,
  InputAdornment,
  OutlinedInput,
  Paper,
  type SvgIconProps,
  Typography,
} from '@mui/material';

import { Search } from '../Search';

export type TIcon = ((props: SvgIconProps) => ReactElement) & { tags?: string[] };

export function IconsGallery(props: {
  icons: ReadonlyArray<{
    name: string;
    Icon: TIcon;
  }>;
}) {
  const [query, setQuery] = useState('');

  const queryLC = query.toLowerCase();
  const filtered = props.icons.filter(
    ({ name, Icon }) =>
      name.toLowerCase().includes(queryLC) ||
      Icon.tags?.some((tag) => tag.toLowerCase().includes(queryLC)),
  );

  return (
    <Box
      sx={({ spacing }) => ({
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridGap: spacing(2),
        padding: 4,
      })}
    >
      <OutlinedInput
        type="search"
        value={query}
        placeholder="Search"
        onChange={({ currentTarget }) => setQuery(currentTarget.value)}
        sx={{ gridColumn: 'span 6' }}
        startAdornment={
          <InputAdornment position="start" disablePointerEvents>
            <Search />
          </InputAdornment>
        }
      />

      {filtered.map(({ name, Icon }) => (
        <Paper
          key={name}
          sx={{
            padding: 2,
            textAlign: 'center',

            '& > svg': {
              fontSize: 32,
              transition: 'font-size 0.3s ease-in-out',
            },

            '&:active > svg': {
              fontSize: 200,
            },
          }}
        >
          <Typography marginBottom={2}>{name}</Typography>
          <Icon />
        </Paper>
      ))}
    </Box>
  );
}
