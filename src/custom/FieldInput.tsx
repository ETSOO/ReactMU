import { ICustomFieldReact } from "@etsoo/react";
import React from "react";
import { InputField } from "../InputField";
import Typography from "@mui/material/Typography";

/**
 * Input field creator
 * type: input
 * @returns Component
 */
export const FieldInput: ICustomFieldReact<string> = ({
  field,
  mref,
  onChange,
  defaultValue
}) => {
  // Ref
  const inputRef = React.useRef<HTMLInputElement>(null);

  const getValue = () => inputRef.current?.value;

  React.useImperativeHandle(mref, () => ({
    getValue,
    setValue(value) {
      if (inputRef.current) inputRef.current.value = `${value ?? ""}`;
    }
  }));

  // Name
  const name = field.name;
  if (!name) {
    return (
      <Typography>No name for FieldInput {JSON.stringify(field)}</Typography>
    );
  }

  return (
    <InputField
      label={field.label ?? ""}
      helperText={field.helperText}
      inputRef={inputRef}
      name={name}
      fullWidth
      defaultValue={defaultValue}
      onChange={() => onChange(name, getValue())}
      {...field.mainSlotProps}
    />
  );
};
