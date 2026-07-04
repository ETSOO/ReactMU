import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import React from "react";
import SignaturePad, { Options } from "signature_pad";
import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import { ResponsiveStyleValue } from "@mui/system";
import { CanvasUtils } from "./utils/CanvasUtils";
import Stack from "@mui/material/Stack";
import ButtonGroup from "@mui/material/ButtonGroup";

/**
 * Extended SignaturePad class with trim method
 */
export class SignaturePadEx extends SignaturePad {
  constructor(
    private readonly canvasElement: HTMLCanvasElement,
    options?: Options
  ) {
    super(canvasElement, options);
  }

  /**
   * Trim the canvas to remove empty space around the signature
   * @returns Trimmed canvas
   */
  trim(): HTMLCanvasElement {
    return CanvasUtils.trim(this.canvasElement);
  }
}

/**
 * Props for SignaturePadComponent
 */
export type SignaturePadComponentProps = {
  /**
   * Width of the canvas
   */
  width: number;

  /**
   * Height of the canvas
   */
  height: number;

  /**
   * Options for SignaturePad
   */
  options?: Options;

  /**
   * Ref for the SignaturePadEx instance
   */
  ref: React.RefObject<SignaturePadEx | null>;
};

/**
 * React component for SignaturePad
 * @param props Props
 * @returns Component
 */
export function SignaturePadComponent(props: SignaturePadComponentProps) {
  // Destruct
  const { width, height, options, ref } = props;

  // Refs
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ref.current = new SignaturePadEx(canvas, options);

    return () => {
      ref.current?.off();
    };
  }, [options, ref]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}

type Placement = "top" | "right" | "bottom" | "left";
type Alignment = "flex-start" | "center" | "flex-end";

/**
 * Methods for SignaturePadFull component
 */
export interface SignaturePadFullMethods {
  getInstance(): SignaturePadEx | null;
}

/**
 * Props for SignaturePadFull component
 */
export type SignaturePadFullProps = Partial<
  Omit<SignaturePadComponentProps, "ref">
> & {
  /**
   * Label for the clear button
   * @default "Clear"
   */
  clearLabel?: string;

  /**
   * Label for the save button
   * @default "Save"
   */
  saveLabel?: string;

  /**
   * Ref for the SignaturePadFull instance
   */
  mRef?: React.RefObject<SignaturePadFullMethods | null>;

  /**
   * Placement of the buttons relative to the canvas
   * @default ["right", "flex-start"]
   */
  placement?: [Placement?, alignment?: Alignment];

  /**
   * Callback when the signature is saved
   * @param signaturePad SignaturePadEx instance
   * @returns void or Promise<void>
   */
  onSave?: (signaturePad: SignaturePadEx) => void | Promise<void>;

  /**
   * Spacing between the canvas and buttons
   * @default 0.5
   */
  spacing?: number;
};

/**
 * Full SignaturePad component with clear and save buttons
 *
 * @param props Props
 * @returns Component
 */
export function SignaturePadFull(props: SignaturePadFullProps) {
  // Destruct
  const {
    clearLabel = "Clear",
    saveLabel = "Save",
    width = 600,
    height = 300,
    mRef,
    onSave,
    options,
    placement = ["right", "flex-start"],
    spacing = 0.5
  } = props;

  // Ref
  const signaturePadRef = React.useRef<SignaturePadEx>(null);

  React.useImperativeHandle(mRef, () => ({
    getInstance: () => signaturePadRef.current
  }));

  function handleClear() {
    signaturePadRef.current?.clear();
  }

  function handleSave() {
    const sp = signaturePadRef.current;
    if (!sp || sp.isEmpty()) return;

    onSave?.(sp);
  }

  const [p = "right", a = "flex-start"] = placement;

  let stackDirection: ResponsiveStyleValue<
    "row" | "row-reverse" | "column" | "column-reverse"
  >;
  let buttonGroupOrientation: "horizontal" | "vertical";

  if (p === "top" || p === "bottom") {
    stackDirection = p === "top" ? "column-reverse" : "column";
    buttonGroupOrientation = "horizontal";
  } else {
    stackDirection = p === "left" ? "row-reverse" : "row";
    buttonGroupOrientation = "vertical";
  }

  return (
    <Stack direction={stackDirection} spacing={spacing} sx={{ alignItems: a }}>
      <Paper sx={{ width, height }}>
        <SignaturePadComponent
          width={width}
          height={height}
          options={options}
          ref={signaturePadRef}
        />
      </Paper>
      <ButtonGroup orientation={buttonGroupOrientation}>
        <Button onClick={handleClear} startIcon={<ClearIcon />}>
          {clearLabel}
        </Button>
        {onSave && (
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<SaveIcon />}
          >
            {saveLabel}
          </Button>
        )}
      </ButtonGroup>
    </Stack>
  );
}
