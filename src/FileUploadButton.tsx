import { Typography } from "@mui/material";
import Button, { ButtonProps } from "@mui/material/Button";
import React from "react";
import { HBox } from "./FlexBox";

/**
 * File upload button props
 */
export type FileUploadButtonProps = ButtonProps<"label"> & {
  /**
   * Drop files label
   */
  dropFilesLabel?: React.ReactNode;

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
  onUploadFiles: (files: FileList) => void;
};

/**
 * File upload button
 * @param props Props
 * @returns Component
 */
export function FileUploadButton(props: FileUploadButtonProps) {
  // Destruct
  const {
    dropFilesLabel,
    maxFiles,
    maxFileSize,
    inputProps,
    onFileInvalid,
    onUploadFiles,
    children = "Browse",
    ...rest
  } = props;

  const { onChange } = inputProps ?? {};

  const [dragOver, setDragOver] = React.useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    validateFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const validateFiles = (files: FileList) => {
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
          if (onFileInvalid) onFileInvalid([maxFileSize, file.size], file);
          return;
        }
      }
    }

    onUploadFiles(files);
  };

  // Layout
  return (
    <HBox
      alignItems="center"
      flexWrap="wrap"
      border={(theme) =>
        dragOver ? "1px dashed " + theme.palette.warning.main : undefined
      }
      spacing={0.5}
      {...(dropFilesLabel == null
        ? undefined
        : {
            onDrop: handleDrop,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave
          })}
    >
      {dropFilesLabel &&
        (typeof dropFilesLabel === "string" ? (
          <Typography variant="body2">{dropFilesLabel}</Typography>
        ) : (
          dropFilesLabel
        ))}
      <Button component="label" sx={{ textTransform: "none" }} {...rest}>
        {children}
        <input
          type="file"
          hidden={true}
          onChange={(event) => {
            if (onChange) onChange(event);
            if (event.isDefaultPrevented()) return;

            const files = event.target.files;
            if (files == null) return;

            const fl = files.length;
            if (fl === 0) return;

            validateFiles(files);
          }}
          {...inputProps}
        />
      </Button>
    </HBox>
  );
}
