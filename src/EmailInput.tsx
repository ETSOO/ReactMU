import { useAppContext } from "./app/ReactApp";
import { MUGlobal } from "./MUGlobal";
import { InputField, InputFieldProps } from "./InputField";

/**
 * Email input props
 */
export type EmailInputProps = Omit<InputFieldProps, "type"> & {};

/**
 * Email input
 * @param props Props
 */
export function EmailInput(props: EmailInputProps) {
  // Global app
  const app = useAppContext();

  // Destruct
  const {
    autoCapitalize = "none",
    autoCorrect = "off",
    autoComplete = "email",
    fullWidth = true,
    label = app?.get("email"),
    name = "email",
    slotProps,
    ...rest
  } = props;

  // Slot props
  const { htmlInput, inputLabel, ...restSlotProps } = slotProps ?? {};

  // Layout
  return (
    <InputField
      type="email"
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      autoComplete={autoComplete}
      fullWidth={fullWidth}
      label={label}
      name={name}
      slotProps={{
        htmlInput: { inputMode: "email", maxLength: 128, ...htmlInput },
        inputLabel: { shrink: MUGlobal.inputFieldShrink, ...inputLabel },
        ...restSlotProps
      }}
      {...rest}
    />
  );
}
