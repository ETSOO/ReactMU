import { IntInputField, IntInputFieldProps } from "./IntInputField";

/**
 * Money input field props
 */
export type MoneyInputFieldProps = IntInputFieldProps & {};

/**
 * Money input field (controlled)
 */
export function MoneyInputField(props: MoneyInputFieldProps) {
  // Destruct
  const { step = 0.01, ...rest } = props;

  // Layout
  return <IntInputField step={step} {...rest} />;
}
