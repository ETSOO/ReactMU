import { InputBaseProps } from "@mui/material";
import React from "react";
import { InputField, InputFieldProps } from "./InputField";

/**
 * Integer input field props
 */
export type IntInputFieldProps = Omit<InputFieldProps, "type" | "inputProps"> &
  InputBaseProps["inputProps"];

/**
 * Integer input field
 */
export const IntInputField = React.forwardRef<
  HTMLDivElement,
  IntInputFieldProps
>((props, ref) => {
  // Destruct
  const { min = 0, step = 1, max = 9999999, ...rest } = props;

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
