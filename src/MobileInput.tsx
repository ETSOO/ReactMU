import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useAppContext } from "./app/ReactApp";

/**
 * Mobile input props
 */
export type MobileInputProps = Omit<TextFieldProps, "type"> & {};

/**
 * Mobile input
 * @param props Props
 */
export function MobileInput(props: MobileInputProps) {
  // Global app
  const app = useAppContext();

  // Destruct
  const {
    slotProps,
    autoCapitalize = "none",
    autoCorrect = "off",
    autoComplete = "mobile",
    fullWidth = true,
    label = app?.get("mobile"),
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
      label={label}
      name={name}
      slotProps={{
        htmlInput: { inputMode: "tel", maxLength: 18 },
        ...slotProps
      }}
      {...rest}
    />
  );
}
