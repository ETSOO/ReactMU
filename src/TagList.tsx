import { Autocomplete, AutocompleteProps, Checkbox, Chip } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { globalApp } from "./app/ReactApp";

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
  inputProps?: Omit<InputFieldProps, "onChange">;

  /**
   * Max items
   */
  maxItems?: number;
};

export function TagList(props: TagListProps) {
  // Labels
  const {
    noOptions,
    loading: loadingLabel,
    more = "More",
    open: openDefault
  } = globalApp?.getLabels("noOptions", "loading", "more", "open") ?? {};

  const moreLabel = more + "...";

  // Destruct
  const {
    renderOption = (props, option, { selected }) => (
      <li {...props}>
        <Checkbox
          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
          checkedIcon={<CheckBoxIcon fontSize="small" />}
          style={{ marginRight: 8 }}
          checked={selected}
        />
        {option}
      </li>
    ),
    renderTags = (value: readonly string[], getTagProps) =>
      value.map((option: string, index: number) => (
        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
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
    ...rest
  } = props;

  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<readonly string[]>([]);
  const loading = open && options.length === 0;

  const loadDataLocal = async (keyword?: string) => {
    const result = (await loadData(keyword, maxItems)) ?? [];
    if (result.length >= maxItems) {
      result.push(moreLabel);
    }
    setOptions(result);
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
        return item === moreLabel;
      }}
      noOptionsText={noOptionsText}
      loadingText={loadingText}
      openText={openText}
      {...rest}
    />
  );
}
