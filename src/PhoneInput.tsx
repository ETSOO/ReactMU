import { useAppContext } from "./app/ReactApp";
import { MUGlobal } from "./MUGlobal";
import { InputField, InputFieldProps } from "./InputField";

/**
 * Phone input props
 */
export type PhoneInputProps = Omit<InputFieldProps, "type"> & {};

/**
 * Phone input
 * @param props Props
 */
export function PhoneInput(props: PhoneInputProps) {
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
    <InputField
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
