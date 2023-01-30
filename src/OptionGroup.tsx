import {
  DataTypes,
  IdDefaultType,
  LabelDefaultType,
  ListType,
  Utils
} from "@etsoo/shared";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormControlProps,
  FormGroup,
  FormHelperText,
  InputLabel,
  Radio,
  RadioGroup,
  useTheme
} from "@mui/material";
import NotchedOutline from "@mui/material/OutlinedInput";
import React from "react";

/**
 * OptionGroup methods ref
 */
export interface OptionGroupRef {
  /**
   * Disable specific items with their ids
   * @param ids Ids
   */
  disable(ids: unknown[]): void;
}

/**
 * OptionGroup props
 */
export type OptionGroupProps<
  T extends object,
  D extends DataTypes.Keys<T>,
  L extends DataTypes.Keys<T, string>
> = Omit<FormControlProps<"fieldset">, "defaultValue"> & {
  /**
   * Default value
   */
  defaultValue?: T[D] | T[D][];

  /**
   * Get option label function
   */
  getOptionLabel?: (option: T) => string;

  /**
   * Id field
   */
  idField?: D;

  /**
   * Label
   */
  label?: string;

  /**
   * Label field
   */
  labelField?: L;

  /**
   * Methods
   */
  mRef?: React.Ref<OptionGroupRef>;

  /**
   * Multiple choose item
   */
  multiple?: boolean;

  /**
   * Field name
   */
  name: string;

  /**
   * On value change handler
   */
  onValueChange?: (value: T[D] | T[D][] | undefined) => void;

  /**
   * Array of options.
   */
  options: ReadonlyArray<T>;

  /**
   * Is the field read only?
   */
  readOnly?: boolean;

  /**
   * Display group of elements in a compact row
   */
  row?: boolean;

  /**
   * Item size
   */
  itemSize?: "small" | "medium";

  /**
   * Helper text
   */
  helperText?: React.ReactNode;
};

/**
 * OptionGroup
 * @param props Props
 * @returns Component
 */
export function OptionGroup<
  T extends object = ListType,
  D extends DataTypes.Keys<T> = IdDefaultType<T>,
  L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
>(props: OptionGroupProps<T, D, L>) {
  // Destruct
  const {
    getOptionLabel,
    defaultValue,
    idField = "id" as D,
    label,
    labelField = "label" as L,
    multiple = false,
    mRef,
    name,
    onValueChange,
    options,
    readOnly,
    row,
    itemSize,
    helperText,
    variant,
    required,
    fullWidth,
    ...rest
  } = props;

  // Theme
  const theme = useTheme();

  // Get option value
  // D type should be the source id type
  const getOptionValue = (option: T): T[D] | null => {
    const value = DataTypes.getValue(option, idField);
    if (value == null) return null;
    return value as T[D];
  };

  // Checkbox values
  const [values, setValues] = React.useState<T[D][]>([]);

  // Values
  const dv = React.useMemo(
    () =>
      defaultValue == null
        ? []
        : Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue],
    [defaultValue]
  );

  React.useEffect(() => {
    setValues(dv);
  }, [dv]);

  // Disabled ids
  const [disabledIds, setDisabledIds] = React.useState<unknown[]>();

  // Item checked
  const itemChecked = (option: T) => {
    // Value
    const value = getOptionValue(option);
    if (value == null) return false;

    return values.includes(value);
  };

  React.useImperativeHandle(mRef, () => ({
    disable(ids: unknown[]) {
      setDisabledIds(ids);
    }
  }));

  // First item value
  const firstOptionValue = getOptionValue(options[0]);

  // Items
  const list = options.map((option) => {
    // Value
    const ov = getOptionValue(option);

    // Control
    const control = multiple ? (
      <Checkbox
        name={name}
        readOnly={readOnly}
        size={itemSize}
        checked={itemChecked(option)}
        disabled={disabledIds?.includes(ov)}
        onChange={(event) => {
          if (firstOptionValue == null) return;

          const typeValue = Utils.parseString(
            event.target.value,
            firstOptionValue
          );

          const changedValues = [...values];
          if (event.target.checked) {
            if (changedValues.includes(typeValue)) return;
            changedValues.push(typeValue);
          } else {
            const index = changedValues.findIndex((v) => v === typeValue);
            if (index === -1) return;
            changedValues.splice(index, 1);
          }

          if (onValueChange) onValueChange(changedValues);
          setValues(changedValues);
        }}
      />
    ) : (
      <Radio
        disabled={disabledIds?.includes(ov)}
        size={itemSize}
        readOnly={readOnly}
      />
    );

    // Label
    const label =
      getOptionLabel == null ? `${option[labelField]}` : getOptionLabel(option);

    // Value, convert to string
    // Will fail when type is number
    const value = getOptionValue(option) as unknown as React.Key;

    return (
      <FormControlLabel
        key={value}
        control={control}
        value={value}
        label={label}
      />
    );
  });

  // Group
  const group = multiple ? (
    <FormGroup row={row}>{list}</FormGroup>
  ) : (
    <RadioGroup
      row={row}
      name={name}
      value={values[0] ?? ""}
      onChange={(_event, value) => {
        if (firstOptionValue == null) return;
        const typeValue = Utils.parseString(value, firstOptionValue);
        if (onValueChange) onValueChange(typeValue);
        setValues([typeValue]);
      }}
    >
      {list}
    </RadioGroup>
  );

  // Layout
  return (
    <React.Fragment>
      <FormControl
        component="fieldset"
        fullWidth={fullWidth}
        sx={{ height: "56px" }} // absolute layout inside relative layout needed
        {...rest}
      >
        {label && (
          <InputLabel required={required} variant={variant} shrink>
            {label}
          </InputLabel>
        )}
        {variant === "outlined" && (
          <NotchedOutline
            label={label && required ? label + " *" : label}
            notched
            sx={{
              cursor: "default",
              position: "absolute",
              width: fullWidth ? "100%" : "auto",
              "& input": {
                visibility: "hidden"
              }
            }}
          />
        )}
        <Box paddingLeft={2} paddingY="7px" position="absolute">
          {group}
        </Box>
      </FormControl>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </React.Fragment>
  );
}
