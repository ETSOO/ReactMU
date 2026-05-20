import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { Currency } from "@etsoo/appscript";
import { NumberUtils } from "@etsoo/shared";
import InputAdornment from "@mui/material/InputAdornment";

/**
 * Number input field properties
 */
export type NumberInputFieldProps = Omit<
  InputFieldProps,
  "type" | "inputProps"
> & {
  /**
   * Currency
   */
  currency?: string | Currency;

  /**
   * End symbol
   */
  endSymbol?: string;

  /**
   * Start (Currency) symbol
   */
  symbol?: string;

  /**
   * Input field style
   */
  inputStyle?: React.CSSProperties;

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
   * Number value change delay in milliseconds, default is 600ms, set to 0 to disable delay
   */
  numberChangeDelay?: number;

  /**
   * Number value change handler
   * @param value New value
   */
  onNumberChange?: (value: number | undefined) => void;
};

/**
 * Number input field, for controlled only components, please see IntInputField and MoneyInputField
 * @param props Props
 * @returns Component
 */
export function NumberInputField(props: NumberInputFieldProps) {
  const {
    currency,
    inputStyle,
    min = 0,
    step = 1,
    symbol = currency
      ? `${currency} ${NumberUtils.getCurrencySymbol(currency)}`
      : undefined,
    endSymbol,
    max = 9999999,
    onChange,
    numberChangeDelay = 600,
    onNumberChange,
    slotProps = {},
    ...rest
  } = props;

  const timeoutRef = React.useRef<number | undefined>(0);

  function doNumberChange(value: number | undefined) {
    if (numberChangeDelay <= 0) {
      onNumberChange!(value);
    } else {
      if (timeoutRef.current == null) return;

      clearTimeout();

      timeoutRef.current = globalThis.setTimeout(
        () => onNumberChange!(value),
        numberChangeDelay
      );
    }
  }

  function clearTimeout() {
    const timeout = timeoutRef.current;
    if (timeout == null) return;
    if (timeout > 0) {
      globalThis.clearTimeout(timeout);
    }
    timeoutRef.current = undefined;
  }

  React.useEffect(() => {
    return clearTimeout;
  }, []);

  return (
    <InputField
      type="number"
      onChange={(event) => {
        onChange?.(event);

        if (onNumberChange) {
          const input = event.target;
          if (input.checkValidity()) {
            const qty = NumberUtils.parse(input.value);
            doNumberChange(qty);
          } else {
            input.reportValidity();
            doNumberChange(undefined);
          }
        }
      }}
      slotProps={Object.assign(slotProps, {
        input: {
          startAdornment: symbol ? (
            <React.Fragment>
              <InputAdornment position="start">{symbol}</InputAdornment>
            </React.Fragment>
          ) : undefined,
          endAdornment: endSymbol ? (
            <InputAdornment position="end">{endSymbol}</InputAdornment>
          ) : undefined
        },
        htmlInput: {
          min,
          step,
          max,
          style: inputStyle,
          inputMode: "numeric"
        }
      })}
      {...rest}
    />
  );
}
