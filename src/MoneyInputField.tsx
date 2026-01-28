import { NumberInputField, NumberInputFieldProps } from "./NumberInputField";

/**
 * Money input field props
 */
export type MoneyInputFieldProps = NumberInputFieldProps & {};

/**
 * Money input field (controlled)
 */
export function MoneyInputField(props: MoneyInputFieldProps) {
  // Destruct
  const { step = 0.01, ...rest } = props;

  // Layout
  return <NumberInputField step={step} {...rest} />;
}
