import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { useAppContext } from "./app/ReactApp";
import Autocomplete, { AutocompleteProps } from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";

export type TagListProps = Omit<
  AutocompleteProps<string, true, false, true>,
  "open" | "multiple" | "freeSolo" | "options" | "renderInput"
> & {
  /**
   * Label
   */
  label?: string;

  /**
   * Load data callback
   */
  loadData: (
    keyword: string | undefined,
    maxItems: number
  ) => PromiseLike<string[] | null | undefined>;

  /**
   * Input props
   */
  inputProps?: Omit<InputFieldProps, "onChangeDelay">;

  /**
   * Max items
   */
  maxItems?: number;
};

export function TagList(props: TagListProps) {
  // Global app
  const app = useAppContext();

  // Labels
  const {
    noOptions,
    loading: loadingLabel,
    more = "More",
    open: openDefault
  } = app?.getLabels("noOptions", "loading", "more", "open") ?? {};

  const moreLabel = more + "...";

  // Destruct
  const {
    getOptionLabel = (option) => option,
    renderOption = ({ key, ...props }, option, { selected }) => (
      <li key={key} {...props}>
        <Checkbox
          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
          checkedIcon={<CheckBoxIcon fontSize="small" />}
          style={{ marginRight: 8 }}
          checked={selected}
        />
        {getOptionLabel(option)}
      </li>
    ),
    renderValue = (value: readonly string[], getTagProps) =>
      value.map((option, index) => {
        const { key, ...rest } = getTagProps({ index });
        return <Chip variant="outlined" key={key} label={option} {...rest} />;
      }),
    noOptionsText = noOptions,
    loadingText = loadingLabel,
    openText = openDefault,
    loadData,
    maxItems = 16,
    disableCloseOnSelect = true,
    openOnFocus = true,
    label,
    inputProps,
    onChange,
    value,
    ...rest
  } = props;

  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<readonly string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [valueState, setValueState] = React.useState<string[]>(value ?? []);

  const loadDataLocal = async (keyword?: string) => {
    setLoading(true);
    const result = (await loadData(keyword, maxItems)) ?? [];

    const len = result.length;

    valueState.forEach((item) => {
      if (!result.includes(item)) result.push(item);
    });

    if (len >= maxItems) {
      result.push(moreLabel);
    } else if (len === 0) {
      // When no result, hide the popup
      setOpen(false);
    }
    setOptions(result);
    setLoading(false);
  };

  return (
    <Autocomplete<string, true, false, true>
      multiple
      freeSolo
      filterOptions={(options, _state) => options}
      open={open}
      onOpen={() => {
        setOpen(true);
        if (options.length === 0) {
          loadDataLocal();
        }
      }}
      onClose={() => {
        setOptions([]);
        setOpen(false);
      }}
      options={options}
      loading={loading}
      disableCloseOnSelect={disableCloseOnSelect}
      clearOnBlur
      openOnFocus={openOnFocus}
      renderOption={renderOption}
      renderValue={renderValue}
      renderInput={(params) => (
        <InputField
          label={label}
          onChangeDelay={async (event) => {
            // Stop bubble
            event.preventDefault();
            event.stopPropagation();

            await loadDataLocal(event.target.value);
          }}
          {...inputProps}
          {...params}
        />
      )}
      getOptionLabel={getOptionLabel}
      getOptionDisabled={(item) => {
        return item === moreLabel;
      }}
      noOptionsText={noOptionsText}
      loadingText={loadingText}
      openText={openText}
      value={valueState}
      onChange={(event, value, reason, details) => {
        setValueState(value);
        if (onChange) onChange(event, value, reason, details);
      }}
      {...rest}
    />
  );
}
