import { Paper, PaperProps } from "@mui/material";
import React from "react";
import Draggable from "react-draggable";

/**
 * Draggable paper component
 * @param props Props
 * @returns Component
 */
export function DraggablePaperComponent(props: PaperProps) {
  const nodeRef = React.useRef(null);
  return (
    <Draggable
      handle=".draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
      nodeRef={nodeRef}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
}
