import { useDelayedExecutor } from "@etsoo/react";
import React from "react";
import { MUGlobal } from "./MUGlobal";
import TextField, { TextFieldProps } from "@mui/material/TextField";

/**
 * Input field props
 */
export type InputFieldProps = TextFieldProps & {
  /**
   * Change delay (ms) to avoid repeatly dispatch onChange
   */
  changeDelay?: number;

  /**
   * Change delay handler, without it onChange will be applied
   */
  onChangeDelay?: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  >;

  /**
   * Is the field read only?
   */
  readOnly?: boolean;

  /**
   * Minimum characters to trigger the change event
   */
  minChars?: number;
};

/**
 * Input field
 * @param props Props
 * @returns Component
 */
export function InputField(props: InputFieldProps) {
  // Destruct
  const {
    InputProps = {},
    inputProps = {},
    slotProps,
    changeDelay,
    onChange,
    onChangeDelay,
    readOnly,
    size = MUGlobal.inputFieldSize,
    variant = MUGlobal.inputFieldVariant,
    minChars = 0,
    ...rest
  } = props;

  // Slot props
  const { htmlInput, input, inputLabel, ...restSlotProps } = slotProps ?? {};

  const isMounted = React.useRef(true);
  const createDelayed = () => {
    if (changeDelay != null && changeDelay >= 1) {
      const changeHandler = onChangeDelay ?? onChange;
      if (changeHandler) return useDelayedExecutor(changeHandler, changeDelay);
    }
    return undefined;
  };
  const delayed = createDelayed();

  const onChangeEx = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // Min characters check
    const len = event.target.value.length;
    if (len > 0 && len < minChars) {
      // Avoid to trigger the form change event
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    if (onChange && (delayed == null || onChangeDelay != null)) onChange(event);
    delayed?.call(undefined, event);
  };

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      delayed?.clear();
    };
  }, []);

  // Layout
  return (
    <TextField
      slotProps={{
        htmlInput: {
          ["data-min-chars"]: minChars,
          ...htmlInput,
          ...inputProps
        },
        input: { readOnly, ...input, ...InputProps },
        inputLabel: {
          shrink: MUGlobal.inputFieldShrink,
          ...inputLabel
        },
        ...restSlotProps
      }}
      onChange={onChangeEx}
      size={size}
      variant={variant}
      {...rest}
    />
  );
}
