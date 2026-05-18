import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { Currency } from "@etsoo/appscript";
import { NumberUtils } from "@etsoo/shared";
import InputAdornment from "@mui/material/InputAdornment";
import { MUGlobal } from "./MUGlobal";

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
    onNumberChange,
    slotProps = {},
    ...rest
  } = props;

  return (
    <InputField
      type="number"
      onChange={(event) => {
        onChange?.(event);

        if (onNumberChange) {
          const input = event.target;
          if (input.checkValidity()) {
            const qty = NumberUtils.parse(input.value);
            onNumberChange(qty);
          } else {
            input.reportValidity();
            onNumberChange(undefined);
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
