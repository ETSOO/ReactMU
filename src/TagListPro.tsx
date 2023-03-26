import { Autocomplete, AutocompleteProps, Checkbox, Chip } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { globalApp } from "./app/ReactApp";

type DataType = {
  id: number | string;
} & ({ label: string } | { name: string });

export type TagListProProps<D extends DataType = DataType> = Omit<
  AutocompleteProps<D, true, false, false>,
  "open" | "multiple" | "options" | "renderInput"
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
    items: number
  ) => PromiseLike<D[] | null | undefined>;

  /**
   * Input props
   */
  inputProps?: Omit<InputFieldProps, "onChange">;

  /**
   * Max items
   */
  maxItems?: number;
};

export function TagListPro<D extends DataType = DataType>(
  props: TagListProProps<D>
) {
  // Labels
  const {
    noOptions,
    loading: loadingLabel,
    more = "More",
    open: openDefault
  } = globalApp?.getLabels("noOptions", "loading", "more", "open") ?? {};

  const moreLabel = more + "...";

  const getLabel = (item: D) =>
    "label" in item ? item.label : "name" in item ? item.name : "";

  // Destruct
  const {
    renderOption = (props, option, { selected }) => (
      <li {...props}>
        <>
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {getLabel(option)}
        </>
      </li>
    ),
    renderTags = (value: readonly D[], getTagProps) =>
      value.map((option, index) => (
        <Chip
          variant="outlined"
          label={getLabel(option)}
          {...getTagProps({ index })}
        />
      )),
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
  const [options, setOptions] = React.useState<readonly D[]>([]);
  const [loading, setLoading] = React.useState(false);

  const currentValue = React.useRef<readonly D[]>([]);
  currentValue.current = value ?? [];

  const loadDataLocal = async (keyword?: string) => {
    setLoading(true);
    const result = (await loadData(keyword, maxItems)) ?? [];
    const len = result.length;

    currentValue.current.forEach((item) => {
      if (!result.some((r) => r.id === item.id)) result.push(item);
    });

    if (len >= maxItems) {
      result.push({ id: -1, name: moreLabel } as D);
    }
    setOptions(result);
    setLoading(false);
  };

  return (
    <Autocomplete<D, true, false, false>
      multiple
      filterOptions={(options, _state) => options}
      open={open}
      onOpen={() => {
        setOpen(true);
        if (options.length === 0) {
          loadDataLocal();
        }
      }}
      onClose={() => {
        setOpen(false);
      }}
      options={options}
      loading={loading}
      disableCloseOnSelect={disableCloseOnSelect}
      openOnFocus={openOnFocus}
      renderOption={renderOption}
      renderTags={renderTags}
      renderInput={(params) => (
        <InputField
          label={label}
          changeDelay={480}
          onChange={async (event) => {
            // Stop bubble
            event.preventDefault();
            event.stopPropagation();

            await loadDataLocal(event.target.value);
          }}
          {...inputProps}
          {...params}
        />
      )}
      getOptionDisabled={(item) => {
        return (
          typeof item.id === "number" &&
          item.id < 0 &&
          getLabel(item) === moreLabel
        );
      }}
      getOptionLabel={(item) => getLabel(item)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      noOptionsText={noOptionsText}
      loadingText={loadingText}
      openText={openText}
      value={value}
      onChange={(event, value, reason, details) => {
        currentValue.current = value;
        if (onChange) onChange(event, value, reason, details);
      }}
      {...rest}
    />
  );
}
