import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

interface SelectOption {
  value: string | number;
  label: string;
}

interface ActionSelectProps {
  value: string | number;
  onChange: (event: SelectChangeEvent<any>) => void;
  options: SelectOption[];
  minWidth?: string | number;
  placeholder?: string;
}

function ActionSelect({
  value,
  onChange,
  options,
  minWidth = "160px",
  placeholder = "",
}: Readonly<ActionSelectProps>) {
  return (
    <FormControl size="small" sx={{ minWidth }}>
      <Select value={value} onChange={onChange} displayEmpty>
        {placeholder && (
          <MenuItem value="">
            <em>{placeholder}</em>
          </MenuItem>
        )}

        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default ActionSelect;