import TextField, { TextFieldProps } from "@mui/material/TextField";

/**
 * Email input props
 */
export type EmailInputProps = Omit<TextFieldProps, "type"> & {};

/**
 * Email input
 * @param props Props
 */
export function EmailInput(props: EmailInputProps) {
  props.slotProps ??= {};
  props.slotProps.htmlInput ??= { maxLength: 128 };

  // Layout
  return <TextField type="email" fullWidth {...props} />;
}
