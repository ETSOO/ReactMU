import { InputField, InputFieldProps } from "@etsoo/materialui";
import React from "react";

/**
 * Data load field properties
 */
export type DataLoadFieldProps = InputFieldProps & {
  /**
   *
   * Load data handler
   */
  loadData: () => Promise<string | undefined>;
};

/**
 * Data load field component
 * @param props Properties
 * @returns Component
 */
export function DataLoadField(props: DataLoadFieldProps) {
  // Destruct
  const { disabled = true, fullWidth = true, loadData, ...rest } = props;

  // Ref
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadData().then((data) => (inputRef.current!.value = data ?? ""));
  }, [loadData]);

  // Layout
  return (
    <InputField
      disabled={disabled}
      fullWidth={fullWidth}
      inputRef={inputRef}
      {...rest}
    />
  );
}
