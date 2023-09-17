import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { Currency } from "@etsoo/appscript";
import { InputAdornment } from "@mui/material";
import { NumberUtils } from "@etsoo/shared";

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
    InputProps,
    ...rest
  } = props;

  return (
    <InputField
      type="number"
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
        ) : undefined,
        ...InputProps
      }}
      {...rest}
    />
  );
}
