import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { DataTypes, ListType2 } from "@etsoo/shared";
import { useAppContext } from "./app/ReactApp";
import Autocomplete, { AutocompleteProps } from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";

export type TagListProProps<D extends ListType2 = ListType2> = Omit<
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

export function TagListPro<D extends ListType2 = ListType2>(
  props: TagListProProps<D>
) {
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

  const getLabel = (item: D) => DataTypes.getListItemLabel(item);

  // Destruct
  const {
    getOptionKey = (option) =>
      typeof option === "string" ? option : option.id,
    renderOption = ({ key, ...props }, option, { selected }) => (
      <li key={key} {...props}>
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
    renderValue = (value: readonly D[], getTagProps) =>
      value.map((option, index) => {
        const { key, ...rest } = getTagProps({ index });
        return (
          <Chip
            variant="outlined"
            key={key}
            label={getLabel(option)}
            {...rest}
          />
        );
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
    } else if (len === 0) {
      // When no result, hide the popup
      setOpen(false);
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
      renderValue={renderValue}
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
      getOptionKey={getOptionKey}
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
