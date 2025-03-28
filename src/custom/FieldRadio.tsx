import { ICustomFieldReact } from "@etsoo/react";
import { IdType } from "@etsoo/shared";
import React from "react";
import { OptionGroup } from "../OptionGroup";
import Typography from "@mui/material/Typography";

/**
 * Radio (single value) field creator
 * type: radio
 * @returns Component
 */
export const FieldRadio: ICustomFieldReact<IdType> = ({
  field,
  mref,
  onChange,
  defaultValue
}) => {
  // State
  const [value, setLocalValue] = React.useState<IdType>();

  // Ref
  const getValue = () => value;
  const setValue = (value: unknown) => {
    if (Array.isArray(value)) {
      setLocalValue(value[0]);
    } else if (typeof value === "string" || typeof value === "number") {
      setLocalValue(value);
    } else {
      setLocalValue(undefined);
    }
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
      <Typography>No name for FieldRadio {JSON.stringify(field)}</Typography>
    );
  }

  return (
    <OptionGroup
      name={name}
      options={field.options ?? []}
      multiple={false}
      row
      helperText={field.helperText}
      label={field.label}
      variant="outlined"
      fullWidth
      defaultValue={value}
      onValueChange={(value) => {
        const newValue = Array.isArray(value)
          ? value[0]
          : value == null
          ? undefined
          : value;
        setLocalValue(newValue);
        onChange(name, newValue);
      }}
      {...field.mainSlotProps}
    />
  );
};
