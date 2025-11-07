import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useAppContext } from "./app/ReactApp";

/**
 * Email input props
 */
export type EmailInputProps = Omit<TextFieldProps, "type"> & {};

/**
 * Email input
 * @param props Props
 */
export function EmailInput(props: EmailInputProps) {
  // Global app
  const app = useAppContext();

  // Destruct
  const {
    slotProps,
    autoCapitalize = "none",
    autoCorrect = "off",
    autoComplete = "email",
    fullWidth = true,
    label = app?.get("email"),
    name = "email",
    ...rest
  } = props;

  // Layout
  return (
    <TextField
      type="email"
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      autoComplete={autoComplete}
      fullWidth={fullWidth}
      label={label}
      name={name}
      slotProps={{
        htmlInput: { inputMode: "email", maxLength: 128 },
        ...slotProps
      }}
      {...rest}
    />
  );
}
