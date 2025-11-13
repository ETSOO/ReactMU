import { useAppContext } from "./app/ReactApp";
import { MUGlobal } from "./MUGlobal";
import { InputField, InputFieldProps } from "./InputField";

/**
 * Mobile input props
 */
export type MobileInputProps = Omit<InputFieldProps, "type"> & {};

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
