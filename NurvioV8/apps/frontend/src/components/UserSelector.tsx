import React from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';
import api from '../services/api';

type Option = { id: string; username: string; role: string; banned: boolean };

type Props = {
  value: Option | null;
  onChange: (v: Option | null) => void;
  label?: string;
};

const UserSelector: React.FC<Props> = ({ value, onChange, label }) => {
  const [options, setOptions] = React.useState<Option[]>([]);
  const [input, setInput] = React.useState('');

  React.useEffect(() => {
    let ignore = false;
    const run = async () => {
      const { data } = await api.get('/admin/users/select-list', { params: { search: input || undefined } });
      if (!ignore) setOptions(data);
    };
    run();
    return () => { ignore = true; };
  }, [input]);

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, v) => onChange(v)}
      inputValue={input}
      onInputChange={(_, v) => setInput(v)}
      getOptionLabel={(o) => `${o.id} | ${o.username}`}
      renderInput={(params) => <TextField {...params} label={label || 'Select user'} />}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {option.id} | {option.username} {option.banned && <Chip size="small" color="error" label="BANNED" sx={{ ml: 1 }} />}
        </li>
      )}
    />
  );
};

export default UserSelector;