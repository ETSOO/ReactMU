import { IdType } from "@etsoo/shared";
import { Typography } from "@mui/material";
import React from "react";
import { ICustomFieldReact } from "@etsoo/react";
import { SelectEx } from "../SelectEx";

/**
 * Select (single value) field creator
 * type select
 * @returns Component
 */
export const FieldSelect: ICustomFieldReact<IdType> = ({
  field,
  mref,
  onChange,
  defaultValue
}) => {
  // State
  const [value, setLocalValue] = React.useState<IdType>();

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

  // Ref
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
      <Typography>No name for FieldSelect {JSON.stringify(field)}</Typography>
    );
  }

  return (
    <SelectEx
      label={field.label ?? ""}
      helperText={field.helperText}
      name={name}
      options={field.options}
      fullWidth
      onChange={(event) => {
        const value = event.target.value;
        const newValue =
          typeof value === "string" || typeof value === "number"
            ? value
            : undefined;
        setLocalValue(newValue);
        onChange(name, newValue);
      }}
      {...field.mainSlotProps}
    />
  );
};
