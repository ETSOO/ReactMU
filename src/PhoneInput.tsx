import TextField, { TextFieldProps } from "@mui/material/TextField";
import { useAppContext } from "./app/ReactApp";
import { MUGlobal } from "./MUGlobal";

/**
 * Phone input props
 */
export type PhoneInputProps = Omit<TextFieldProps, "type"> & {};

/**
 * Phone input
 * @param props Props
 */
export function PhoInput(props: PhoneInputProps) {
  // Global app
  const app = useAppContext();

  // Destruct
  const {
    slotProps,
    autoCapitalize = "none",
    autoCorrect = "off",
    autoComplete = "phone",
    fullWidth = true,
    label = app?.get("phone"),
    name = "phone",
    ...rest
  } = props;

  // Slot props
  const { htmlInput, inputLabel, ...restSlotProps } = slotProps ?? {};

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
        htmlInput: { inputMode: "tel", maxLength: 18, ...htmlInput },
        inputLabel: { shrink: MUGlobal.inputFieldShrink, ...inputLabel },
        ...restSlotProps
      }}
      {...rest}
    />
  );
}
