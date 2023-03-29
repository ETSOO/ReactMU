import { Autocomplete, AutocompleteProps } from "@mui/material";
import React from "react";
import { globalApp } from "./app/ReactApp";
import { InputField, InputFieldProps } from "./InputField";
import { ListType2 } from "@etsoo/shared";

export type ComboBoxProProps<D extends ListType2 = ListType2> = Omit<
  AutocompleteProps<D, false, false, true>,
  "open" | "multiple" | "options" | "renderInput"
> & {
  /**
   * Label
   */
  label?: string;

  /**
   * Field name
   */
  name?: string;

  /**
   * Id value
   */
  idValue?: D["id"] | null;

  /**
   * Options
   */
  options: (() => PromiseLike<D[] | null | undefined>) | D[];

  /**
   * Input props
   */
  inputProps?: Omit<InputFieldProps, "onChange">;
};

export function ComboBoxPro<D extends ListType2 = ListType2>(
  props: ComboBoxProProps<D>
) {
  // Labels
  const {
    noOptions,
    loading: loadingLabel,
    open: openDefault
  } = globalApp?.getLabels("noOptions", "loading", "open") ?? {};

  const getLabel = (item: D) =>
    "label" in item ? item.label : "name" in item ? item.name : "";

  // Destruct
  const {
    noOptionsText = noOptions,
    loadingText = loadingLabel,
    openText = openDefault,
    options,
    openOnFocus = true,
    label,
    inputProps,
    name,
    value,
    idValue,
    onChange,
    ...rest
  } = props;

  const [open, setOpen] = React.useState(false);
  const [localOptions, setOptions] = React.useState<readonly D[]>([]);
  const [localValue, setValue] = React.useState<string | D | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (value === undefined) return;
    setValue(value);
  }, [value]);

  React.useEffect(() => {
    if (idValue == null) return;
    const option = localOptions.find((option) => option.id === idValue);
    if (option) setValue(option);
    else setValue(null);
  }, [localOptions]);

  React.useEffect(() => {
    if (typeof options === "function") {
      setLoading(true);
      options().then((result) => {
        setLoading(false);
        if (result != null) setOptions(result);
      });
    } else {
      setOptions(options);
    }
  }, [options]);

  return (
    <Autocomplete<D, false, false, true>
      id={name}
      value={localValue == null ? "" : localValue}
      open={open}
      freeSolo
      clearOnBlur={false}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      options={localOptions}
      loading={loading}
      openOnFocus={openOnFocus}
      renderInput={(params) => (
        <InputField
          {...inputProps}
          {...params}
          label={label}
          name={name}
          onBlur={(event) => {
            if (localValue == null && onChange)
              onChange(event, event.target.value, "blur", undefined);
          }}
        />
      )}
      getOptionLabel={(item) =>
        typeof item === "object" ? getLabel(item) : item
      }
      isOptionEqualToValue={(option, value) => option.id === value.id}
      noOptionsText={noOptionsText}
      loadingText={loadingText}
      openText={openText}
      onChange={(event, value, reason, details) => {
        setValue(value);
        if (onChange) onChange(event, value, reason, details);
      }}
      {...rest}
    />
  );
}
