import Avatar from "@mui/material/Avatar";
import Button, { ButtonProps } from "@mui/material/Button";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import React, { CSSProperties } from "react";

/**
 * Image preview button props
 */
export type ImagePreviewButtonProps = {
  /**
   * Button props
   */
  buttonProps?: Omit<ButtonProps, "onClick" | "disabled">;

  /**
   * Dialog props
   */
  dialogProps?: Omit<DialogProps, "open" | "onClose">;

  /**
   * Image
   */
  image?: string;

  /**
   * Object fit style
   */
  objectFit?: CSSProperties["objectFit"];

  /**
   * Size
   */
  size?: number | [number, number];
};

/**
 * Image preview button
 * @param props Props
 * @returns Component
 */
export function ImagePreviewButton(props: ImagePreviewButtonProps) {
  // Destruct
  const {
    buttonProps,
    dialogProps,
    image,
    objectFit = "contain",
    size = 32
  } = props;

  const [open, setOpen] = React.useState(false);

  const [width, height] = typeof size === "number" ? [size, size] : size;

  return (
    <React.Fragment>
      <Button
        onClick={() => setOpen(true)}
        variant="text"
        disabled={!image}
        sx={{
          p: 0,
          minWidth: 0
        }}
        {...buttonProps}
      >
        <Avatar
          src={image}
          variant="rounded"
          sx={{
            width,
            height,
            "& img": {
              objectFit
            }
          }}
        />
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        {...dialogProps}
      >
        <DialogContent>
          {image && (
            <img src={image} style={{ maxWidth: "100%", height: "auto" }} />
          )}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
