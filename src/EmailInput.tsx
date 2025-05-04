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
  // Destruct
  const { slotProps, ...rest } = props;

  // Layout
  return (
    <TextField
      type="email"
      fullWidth
      slotProps={{ htmlInput: { maxLength: 128 }, ...slotProps }}
      {...rest}
    />
  );
}
