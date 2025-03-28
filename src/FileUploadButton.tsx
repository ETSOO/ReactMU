import Button, { ButtonProps } from "@mui/material/Button";
import React from "react";

/**
 * File upload button props
 */
export type FileUploadButtonProps = ButtonProps<"label"> & {
  /**
   * Max files allowed
   */
  maxFiles?: number;

  /**
   * Max file size
   */
  maxFileSize?: number;

  /**
   * Input field attributes
   */
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "hidden"
  >;

  /**
   * File invalid handler
   * @param values [expected, actual]
   * @param file File
   */
  onFileInvalid?: (values: [number, number], file?: File) => void;

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
  const {
    maxFiles,
    maxFileSize,
    inputProps,
    onFileInvalid,
    onUploadFiles,
    children,
    ...rest
  } = props;

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
            if (files == null) return;

            const fl = files.length;
            if (fl === 0) return;

            if (maxFiles && maxFiles > 0 && fl > maxFiles) {
              if (onFileInvalid) onFileInvalid([maxFiles, fl]);
              return;
            }

            if (maxFileSize && maxFileSize > 0) {
              for (let f = 0; f < fl; f++) {
                const file = files[f];
                if (file.size > maxFileSize) {
                  if (onFileInvalid)
                    onFileInvalid([maxFileSize, file.size], file);
                  return;
                }
              }
            }

            onUploadFiles(files);
          }
        }}
        {...inputProps}
      />
    </Button>
  );
}
