import React from "react";
import { InputField, InputFieldProps } from "./InputField";

/**
 * Number input field properties
 */
export type NumberInputFieldProps = Omit<
  InputFieldProps,
  "type" | "inputProps"
> & {
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
    inputStyle = { textAlign: "right" },
    min = 0,
    step = 1,
    max = 9999999,
    ...rest
  } = props;

  return (
    <InputField
      inputProps={{
        min,
        step,
        max,
        style: inputStyle,
        inputMode: "numeric"
      }}
      {...rest}
    />
  );
}
