import React from "react";
import { InputField, InputFieldProps } from "./InputField";
import { useRequiredAppContext } from "./app/ReactApp";

/**
 * JSON data input component properties
 */
export type JsonDataInputProps = Omit<InputFieldProps, "multiple">;

/**
 * JSON data input component
 * @param props - Component properties
 * @returns JSX Element
 */
export function JsonDataInput(props: JsonDataInputProps) {
  // Destruct
  const { onChange, rows = 3, ...rest } = props;

  // Global app
  const app = useRequiredAppContext();
  const jsonError = app.get("jsonDataError") ?? "JSON format error";

  // Error message
  const [error, setError] = React.useState<string>();

  // Layout
  return (
    <InputField
      multiline
      rows={rows}
      {...rest}
      error={!!error}
      helperText={error}
      onChange={(e) => {
        if (onChange) {
          onChange(e);
          if (e.isDefaultPrevented()) return;
        }

        const json = e.target.value;
        if (json) {
          try {
            JSON.parse(json);
          } catch (e) {
            setError(
              `${jsonError}: ${e instanceof Error ? e.message : String(e)}`
            );
            return;
          }
        }

        setError(undefined);
      }}
    />
  );
}
