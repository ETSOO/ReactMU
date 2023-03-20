import { Autocomplete, AutocompleteProps, Checkbox, Chip } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React from "react";
import { InputField } from "./InputField";
import { globalApp } from "./app/ReactApp";

export type TagListProps = Omit<
  AutocompleteProps<string, true, false, true>,
  "open" | "multiple" | "freeSolo" | "options" | "renderInput"
> & {
  /**
   * Load data callback
   */
  loadData: (
    keyword: string | undefined,
    maxItems: number
  ) => PromiseLike<string[] | null | undefined>;

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
    ...rest
  } = props;

  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<readonly string[]>([]);
  const loading = open && options.length === 0;

  return (
    <Autocomplete<string, true, false, true>
      multiple
      freeSolo
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      options={options}
      loading={loading}
      renderOption={renderOption}
      renderTags={renderTags}
      renderInput={(params) => (
        <InputField
          changeDelay={480}
          onChange={async (event) => {
            const result = (await loadData(event.target.value, maxItems)) ?? [];
            if (result.length >= maxItems) {
              result.push(moreLabel);
            }
            setOptions(result);
          }}
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
