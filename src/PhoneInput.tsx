import TextField, { TextFieldProps } from "@mui/material/TextField";

/**
 * Phone input props
 */
export type PhoneInputProps = Omit<TextFieldProps, "type"> & {};

/**
 * Phone input
 * @param props Props
 */
export function PhoInput(props: PhoneInputProps) {
  // Destruct
  const {
    slotProps,
    autoCapitalize = "none",
    autoCorrect = "off",
    autoComplete = "phone",
    fullWidth = true,
    name = "phone",
    ...rest
  } = props;

  // Layout
  return (
    <TextField
      type="tel"
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      autoComplete={autoComplete}
      fullWidth={fullWidth}
      name={name}
      slotProps={{
        htmlInput: { inputMode: "tel", maxLength: 18 },
        ...slotProps
      }}
      {...rest}
    />
  );
}
