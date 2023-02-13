import { InputBaseProps } from "@mui/material";
import React from "react";
import { InputField, InputFieldProps } from "./InputField";

/**
 * Money input field props
 */
export type MoneyInputFieldProps = Omit<
  InputFieldProps,
  "type" | "inputProps"
> &
  InputBaseProps["inputProps"];

/**
 * Money input field
 */
export const MoneyInputField = React.forwardRef<
  HTMLDivElement,
  MoneyInputFieldProps
>((props, ref) => {
  // Destruct
  const { min = 0, step = 0.01, max = 9999999, ...rest } = props;

  // Layout
  return (
    <InputField
      ref={ref}
      type="number"
      inputProps={{ min, step, max, inputMode: "numeric" }}
      {...rest}
    />
  );
});
