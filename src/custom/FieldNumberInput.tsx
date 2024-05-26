import { ICustomFieldReact } from "@etsoo/react";
import { Typography } from "@mui/material";
import React from "react";
import { NumberInputField } from "../NumberInputField";
import { NumberUtils } from "@etsoo/shared";

/**
 * Number input field creator
 * type: number
 * @returns Component
 */
export const FieldNumberInput: ICustomFieldReact<number> = ({
  field,
  mref,
  onChange,
  defaultValue
}) => {
  // Ref
  const inputRef = React.useRef<HTMLInputElement>();

  const getValue = () => {
    const value = inputRef.current?.valueAsNumber;
    return NumberUtils.parse(value);
  };

  const setValue = (value: unknown) => {
    if (inputRef.current) inputRef.current.value = `${value ?? ""}`;
  };
  React.useImperativeHandle(mref, () => ({
    getValue,
    setValue
  }));

  React.useEffect(() => {
    if (defaultValue == null) return;
    setValue(defaultValue);
  }, [defaultValue]);

  // Name
  const name = field.name;
  if (!name) {
    return (
      <Typography>
        No name for FieldNumberInput {JSON.stringify(field)}
      </Typography>
    );
  }

  return (
    <NumberInputField
      label={field.label ?? ""}
      helperText={field.helperText}
      inputRef={inputRef}
      name={name}
      fullWidth
      onChange={() => onChange(name, getValue())}
      {...field.mainSlotProps}
    />
  );
};
