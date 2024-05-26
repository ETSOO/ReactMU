import { ICustomFieldReact } from "@etsoo/react";
import React from "react";
import { SwitchAnt } from "../SwitchAnt";
import { Typography } from "@mui/material";

/**
 * Input field creator
 * type: switch
 * @returns Component
 */
export const FieldSwitch: ICustomFieldReact<boolean> = ({
  field,
  mref,
  onChange,
  defaultValue
}) => {
  // State
  const [value, setLocalValue] = React.useState<boolean>();

  const getValue = () => value;
  const setValue = (value: unknown) => {
    if (typeof value === "boolean") setLocalValue(value);
    else if (value === "true" || value === "1" || value === 1)
      setLocalValue(true);
    else if (value === "false" || value === "0" || value === 0)
      setLocalValue(false);
    else setLocalValue(undefined);
  };

  React.useImperativeHandle(mref, () => ({
    getValue,
    setValue
  }));

  // Name
  const name = field.name;
  if (!name) {
    return (
      <Typography>No name for FieldSwitch {JSON.stringify(field)}</Typography>
    );
  }

  React.useEffect(() => {
    if (defaultValue == null) return;
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <SwitchAnt
      name={name}
      onChange={(_event, value) => {
        setLocalValue(value);
        onChange(name, value);
      }}
      {...field.mainSlotProps}
    />
  );
};
