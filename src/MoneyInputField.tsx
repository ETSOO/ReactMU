import React from "react";
import { IntInputField, IntInputFieldProps } from "./IntInputField";

/**
 * Money input field props
 */
export type MoneyInputFieldProps = IntInputFieldProps & {};

/**
 * Money input field (controlled)
 */
export const MoneyInputField = React.forwardRef<
  HTMLDivElement,
  MoneyInputFieldProps
>((props, ref) => {
  // Destruct
  const { step = 0.01, ...rest } = props;

  // Layout
  return <IntInputField ref={ref} step={step} {...rest} />;
});
