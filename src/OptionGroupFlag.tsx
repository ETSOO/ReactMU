import {
  DataTypes,
  IdDefaultType,
  LabelDefaultType,
  ListType,
  Utils
} from "@etsoo/shared";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl, { FormControlProps } from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import NotchedOutline from "@mui/material/OutlinedInput";
import React from "react";

/**
 * OptionGroupFlag methods ref
 */
export interface OptionGroupFlagRef {
  /**
   * Disable specific items with their ids
   * @param ids Ids
   */
  disable(ids: number[]): void;
}

/**
 * OptionGroupFlag props
 */
export type OptionGroupFlagProps<
  T extends object,
  D extends DataTypes.Keys<T, number>,
  L extends DataTypes.Keys<T, string>
> = Omit<FormControlProps, "defaultValue"> & {
  /**
   * Default value
   */
  defaultValue?: T[D] & number;

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
  mRef?: React.Ref<OptionGroupFlagRef>;

  /**
   * Field name
   */
  name: string;

  /**
   * On value change handler
   */
  onValueChange?: (value?: T[D] & number) => void;

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
 * OptionGroupFlag
 * @param props Props
 * @returns Component
 */
export function OptionGroupFlag<
  T extends object = ListType,
  D extends DataTypes.Keys<T, number> = IdDefaultType<T, number>,
  L extends DataTypes.Keys<T, string> = LabelDefaultType<T>
>(props: OptionGroupFlagProps<T, D, L>) {
  // Destruct
  const {
    getOptionLabel,
    defaultValue,
    idField = "id" as D,
    label,
    labelField = "label" as L,
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
    sx = {},
    ...rest
  } = props;

  // Outlined
  const outlined = variant === "outlined";

  // Get option value
  // D type should be the source id type
  const getOptionValue = (option: T): (T[D] & number) | null => {
    const value = DataTypes.getValue(option, idField);
    if (value == null) return null;
    return value as T[D] & number;
  };

  // Value
  const [value, setValue] = React.useState(defaultValue);

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // Disabled ids
  const [disabledIds, setDisabledIds] = React.useState<number[]>();

  // Item checked
  const itemChecked = (option: T) => {
    // Value
    const itemValue = getOptionValue(option);
    if (itemValue == null || value == null) return false;

    return (value & itemValue) > 0;
  };

  React.useImperativeHandle(mRef, () => ({
    disable(ids: number[]) {
      setDisabledIds(ids);
    }
  }));

  // First item value
  const firstOptionValue = getOptionValue(options[0]);

  // Items
  const list = options.map((option) => {
    // Value
    const ov = getOptionValue(option);
    if (ov == null) return;

    // Control
    const control = (
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

          const newValue = (
            value == null
              ? event.target.checked
                ? typeValue
                : undefined
              : event.target.checked
              ? value | typeValue
              : value ^ typeValue
          ) as (T[D] & number) | undefined;

          if (onValueChange) onValueChange(newValue);
          setValue(newValue);
        }}
      />
    );

    // Label
    const label =
      getOptionLabel == null ? `${option[labelField]}` : getOptionLabel(option);

    return (
      <FormControlLabel key={ov} control={control} value={ov} label={label} />
    );
  });

  // Group
  const group = <FormGroup row={row}>{list}</FormGroup>;

  // Layout
  return (
    <React.Fragment>
      <FormControl fullWidth={fullWidth} sx={sx} {...rest}>
        {label && (
          <InputLabel required={required} variant={variant} shrink>
            {label}
          </InputLabel>
        )}
        {outlined ? (
          <NotchedOutline
            label={label && required ? label + " *" : label}
            notched
            endAdornment={group}
            sx={{
              cursor: "default",
              display: "flex",
              gap: 1,
              paddingX: 2,
              paddingY: "7px",
              width: fullWidth ? "100%" : "auto",
              "& input": {
                display: "none"
              }
            }}
          />
        ) : (
          <Box paddingLeft={2} paddingY="7px">
            {group}
          </Box>
        )}
      </FormControl>
      {helperText && (
        <FormHelperText sx={{ marginLeft: 2, marginRight: 2 }}>
          {helperText}
        </FormHelperText>
      )}
    </React.Fragment>
  );
}
