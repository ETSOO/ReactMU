import TextField, { TextFieldProps } from "@mui/material/TextField";

/**
 * Mobile input props
 */
export type MobileInputProps = Omit<TextFieldProps, "type"> & {};

/**
 * Mobile input
 * @param props Props
 */
export function MobileInput(props: MobileInputProps) {
  // Destruct
  const {
    slotProps,
    autoCapitalize = "none",
    autoCorrect = "off",
    autoComplete = "mobile",
    fullWidth = true,
    name = "mobile",
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
