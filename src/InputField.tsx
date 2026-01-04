import { useDelayedExecutor } from "@etsoo/react";
import React from "react";
import { MUGlobal } from "./MUGlobal";
import TextField, { TextFieldProps } from "@mui/material/TextField";

/**
 * Input field props
 */
export type InputFieldProps = TextFieldProps & {
  /**
   * Change [delay (ms), Minimum characters] to avoid repeatly dispatch
   */
  changeDelay?: [number, number?];

  /**
   * Change delay handler
   */
  onChangeDelay?: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  >;

  /**
   * Is the field read only?
   */
  readOnly?: boolean;
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
    onChange,
    onChangeDelay,
    changeDelay = onChangeDelay ? [480] : undefined,
    readOnly,
    size = MUGlobal.inputFieldSize,
    variant = MUGlobal.inputFieldVariant,
    ...rest
  } = props;

  // Slot props
  const { htmlInput, input, inputLabel, ...restSlotProps } = slotProps ?? {};

  const isMounted = React.useRef(true);
  const createDelayed = () => {
    if (onChangeDelay && changeDelay && changeDelay[0] >= 1) {
      return useDelayedExecutor(onChangeDelay, changeDelay[0]);
    }
    return undefined;
  };
  const delayed = createDelayed();

  const onChangeEx = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // Change handler
    onChange?.(event);

    if (onChangeDelay && changeDelay && delayed) {
      const [_, minChars = 0] = changeDelay;

      if (minChars > 0) {
        const len = event.target.value.length;
        if (len < minChars) return;
      }

      delayed.call(undefined, event);
    }
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
          ["data-min-chars"]: changeDelay?.[1],
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
