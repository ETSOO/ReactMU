import { useDelayedExecutor } from "@etsoo/react";
import { TextField, TextFieldProps } from "@mui/material";
import React from "react";
import { MUGlobal } from "./MUGlobal";

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
export const InputField = React.forwardRef<HTMLDivElement, InputFieldProps>(
  (props, ref) => {
    // Destruct
    const {
      changeDelay,
      InputLabelProps = {},
      InputProps = {},
      inputProps = {},
      onChange,
      onChangeDelay,
      readOnly,
      size = MUGlobal.inputFieldSize,
      variant = MUGlobal.inputFieldVariant,
      minChars = 0,
      ...rest
    } = props;

    // Shrink
    InputLabelProps.shrink ??= MUGlobal.searchFieldShrink;

    // Read only
    if (readOnly != null) InputProps.readOnly = readOnly;

    // Min characters
    inputProps["data-min-chars"] = minChars;

    const isMounted = React.useRef(true);
    const createDelayed = () => {
      if (changeDelay != null && changeDelay >= 1) {
        const changeHandler = onChangeDelay ?? onChange;
        if (changeHandler)
          return useDelayedExecutor(changeHandler, changeDelay);
      }
      return undefined;
    };
    const delayed = createDelayed();

    const onChangeEx = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      // Min characters check
      const len = event.target.value.length;
      if (len > 0 && len < minChars) return;

      if (onChange && (delayed == null || onChangeDelay != null))
        onChange(event);
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
        ref={ref}
        InputLabelProps={InputLabelProps}
        InputProps={InputProps}
        inputProps={inputProps}
        onChange={onChangeEx}
        size={size}
        variant={variant}
        {...rest}
      />
    );
  }
);
