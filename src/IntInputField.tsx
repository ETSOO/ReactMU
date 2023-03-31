import { Box, IconButton, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React from "react";
import { InputField, InputFieldProps } from "./InputField";

/**
 * Integer input field props
 */
export type IntInputFieldProps = Omit<
  InputFieldProps,
  "type" | "inputProps" | "value"
> & {
  /**
   * Minimum value
   */
  min?: number;

  /**
   * Maximum value
   */
  max?: number;

  /**
   * Step value
   */
  step?: number;

  /**
   * Display minus and plus buttons
   */
  buttons?: boolean;

  /**
   * End symbol
   */
  endSymbol?: string;

  /**
   * Start (Currency) symbol
   */
  symbol?: string;

  /**
   * Value
   */
  value?: number;

  /**
   * Input field style
   */
  inputStyle?: React.CSSProperties;

  /**
   * On value change callback
   * @param value Value
   */
  onValueChange?: (value: number | undefined, init: boolean) => void;
};

/**
 * Integer input field
 */
export const IntInputField = React.forwardRef<
  HTMLDivElement,
  IntInputFieldProps
>((props, ref) => {
  // Destruct
  const {
    min = 0,
    step = 1,
    max = 9999999,
    inputStyle = { textAlign: "right" },
    buttons,
    endSymbol,
    symbol,
    value,
    defaultValue,
    onChange,
    onValueChange,
    ...rest
  } = props;

  // State
  const [localValue, setLocalValue] = React.useState<number>();

  const setValue = (value: number | undefined, init: boolean = false) => {
    setLocalValue(value);
    if (onValueChange) onValueChange(value, init);
  };

  React.useEffect(() => {
    setValue(value, true);
  }, [value]);

  React.useEffect(() => {
    if (defaultValue == null) return;
    const value =
      typeof defaultValue === "number"
        ? defaultValue
        : parseFloat(`${defaultValue}`);
    if (!isNaN(value)) setValue(value, true);
  }, [defaultValue]);

  // Layout
  const layout = (
    <InputField
      ref={ref}
      type="number"
      value={localValue == null ? "" : localValue}
      inputProps={{
        min,
        step,
        max,
        style: inputStyle,
        inputMode: "numeric"
      }}
      InputProps={{
        startAdornment: symbol ? (
          <React.Fragment>
            <InputAdornment position="start">{symbol}</InputAdornment>
          </React.Fragment>
        ) : undefined,
        endAdornment: endSymbol ? (
          <InputAdornment position="end">{endSymbol}</InputAdornment>
        ) : undefined
      }}
      sx={{
        "& input[type=number]::-webkit-inner-spin-button": {
          WebkitAppearance: "none",
          margin: 0
        },
        "& input[type=number]::-webkit-outer-spin-button": {
          WebkitAppearance: "none",
          margin: 0
        }
      }}
      onChange={(event) => {
        const value = parseFloat(event.target.value);
        if (isNaN(value)) setValue(undefined);
        else if (value > max) setValue(max);
        else if (value < min) setValue(min);
        else setValue(value);
        if (onChange) onChange(event);
      }}
      {...rest}
    />
  );

  if (buttons)
    return (
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => {
            if (localValue == null) return;
            if (localValue <= min) setValue(undefined);
            else setValue(localValue - step);
          }}
        >
          <RemoveIcon />
        </IconButton>
        {layout}
        <IconButton
          size="small"
          onClick={() => {
            if (localValue == null) {
              setValue(min);
              return;
            }
            if (localValue >= max) return;
            else setValue(localValue + step);
          }}
        >
          <AddIcon color={localValue == null ? undefined : "primary"} />
        </IconButton>
      </Box>
    );
  else return layout;
});
