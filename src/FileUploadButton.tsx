import { Button, ButtonProps } from "@mui/material";
import React from "react";

/**
 * File upload button props
 */
export type FileUploadButtonProps = ButtonProps<"label"> & {
  /**
   * Input field attributes
   */
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "hidden"
  >;

  /**
   * Upload files callback
   * @param files Files
   */
  onUploadFiles?: (files: FileList) => void;
};

/**
 * File upload button
 * @param props Props
 * @returns Component
 */
export function FileUploadButton(props: FileUploadButtonProps) {
  // Destruct
  const { inputProps, onUploadFiles, children, ...rest } = props;

  const { onChange } = inputProps ?? {};

  // Layout
  return (
    <Button component="label" {...rest}>
      {children}
      <input
        type="file"
        hidden={true}
        onChange={(event) => {
          if (onChange) onChange(event);
          if (event.isDefaultPrevented()) return;

          if (onUploadFiles) {
            const files = event.target.files;
            if (files == null || files.length == 0) return;
            onUploadFiles(files);
          }
        }}
        {...inputProps}
      />
    </Button>
  );
}
