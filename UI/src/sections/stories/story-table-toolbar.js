import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// components
import Iconify from 'src/components/iconify';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
// ----------------------------------------------------------------------

export default function StoryTableToolbar({
  filters,
  onFilters,
  categoriesData,
  languagesData,
  onChangeLanguage
}) {
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterCategory = useCallback(
    (event) => {
      onFilters('category', event.target.value);
    },
    [onFilters]
  );

  const handleFilterlanguage = useCallback(
    (event) => {
      onFilters('language', event.target.value);
      onChangeLanguage(event.target.value);
    },
    [onChangeLanguage, onFilters]
  );

  return (
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
                  <FormControl
             sx={{
              flexShrink: 0,
              width: { xs: 1, md: 200 },
            }}
          >
            <InputLabel labelId='lang-label'>Language</InputLabel>
            <Select
              value={filters.language}
              onChange={handleFilterlanguage}
              label='Select category..'
              labelId='lang-label'
            >
              {languagesData?.length > 0 ? languagesData.map((lang) => (
                <MenuItem key={lang.id} value={lang.id}>
                  {lang.langName}{` `}({lang.nativeLangName})
                </MenuItem>
              )) : 
                <MenuItem disabled>
                  No Languages..
                </MenuItem>
              }
            </Select>
          </FormControl>
        <FormControl
             sx={{
              flexShrink: 0,
              width: { xs: 1, md: 200 },
            }}
          >
            <InputLabel labelId='cat-label'>Category</InputLabel>
            <Select
              value={filters.category}
              onChange={handleFilterCategory}
              label='Select category..'
              labelId='cat-label'
            >
              {categoriesData?.length > 0 ? categoriesData.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </MenuItem>
              )) : 
                <MenuItem disabled>
                  No Categories..
                </MenuItem>
              }
            </Select>
          </FormControl>
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>
  );
}

StoryTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  categoriesData: PropTypes.array,
  languagesData: PropTypes.array,
  onChangeLanguage: PropTypes.func
};
