import { Box, IconButton, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React from "react";
import { NumberUtils } from "@etsoo/shared";
import { InputField, InputFieldProps } from "./InputField";

/**
 * Integer input field props
 */
export type IntInputFieldProps = Omit<
  InputFieldProps,
  "type" | "inputProps" | "value" | "defaultValue"
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
   * @param source Source value
   * @param init Initial action
   */
  onValueChange?: (
    value: number | undefined,
    source: unknown,
    init: boolean
  ) => number | boolean | null | void;
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
    changeDelay = 600,
    onChangeDelay,
    onChange,
    onValueChange,
    required,
    ...rest
  } = props;

  // State
  const [localValue, setLocalValue] = React.useState<number | string>();

  const setValue = (
    value: number | undefined,
    source: unknown,
    init: boolean = false
  ) => {
    if (onValueChange) {
      const newValue = onValueChange(value, source, init);
      if (newValue === false) return;

      if (newValue === null) {
        setLocalValue(undefined);
        return;
      }

      if (newValue === true || newValue === undefined) setLocalValue(value);
      else setLocalValue(newValue);
    }
  };

  React.useEffect(() => {
    setValue(value, undefined, true);
  }, [value]);

  // Layout
  const layout = (
    <InputField
      ref={ref}
      type="number"
      value={localValue == null ? (required ? min : "") : localValue}
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
        const source = event.target.value;
        setLocalValue(source);

        if (onChange) onChange(event);
      }}
      changeDelay={changeDelay}
      onChangeDelay={(event) => {
        const source = event.target.value;
        const value = parseFloat(source);
        if (isNaN(value)) setValue(undefined, source);
        else if (value > max) setValue(max, source);
        else if (value < min) setValue(value === 0 ? undefined : min, source);
        // 0 is a special case
        else setValue(value, source);

        if (onChangeDelay) onChangeDelay(event);
      }}
      required={required}
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

            const value = NumberUtils.parse(localValue);
            if (isNaN(value)) return;

            if (value <= min) setValue(undefined, "SUB");
            else setValue(value - step, "SUB");
          }}
        >
          <RemoveIcon />
        </IconButton>
        {layout}
        <IconButton
          size="small"
          onClick={() => {
            if (localValue == null) {
              setValue(min, "ADD");
              return;
            }

            const value = NumberUtils.parse(localValue);
            if (isNaN(value)) return;

            if (value >= max) return;
            else setValue(value + step, "ADD");
          }}
        >
          <AddIcon color={localValue == null ? undefined : "primary"} />
        </IconButton>
      </Box>
    );
  else return layout;
});
