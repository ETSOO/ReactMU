import { Button, ButtonGroup, Skeleton, Slider, Stack } from "@mui/material";
import React from "react";
import type AvatarEditor from "react-avatar-editor";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ComputerIcon from "@mui/icons-material/Computer";
import DoneIcon from "@mui/icons-material/Done";
import { Labels } from "./app/Labels";

/**
 * User avatar editor to Blob helper
 */
export interface UserAvatarEditorToBlob {
  (
    canvas: HTMLCanvasElement,
    mimeType?: string,
    quality?: number
  ): Promise<Blob>;
}

/**
 * User avatar editor on done handler
 */
export interface UserAvatarEditorOnDoneHandler {
  (canvas: HTMLCanvasElement, toBlob: UserAvatarEditorToBlob): void;
}

/**
 * User avatar editor props
 */
export interface UserAvatarEditorProps {
  /**
   * Cropping border size
   */
  border?: number;

  /**
   * Image source
   */
  image?: string | File;

  /**
   * Max width to save
   */
  maxWidth?: number;

  /**
   * On done handler
   */
  onDone: UserAvatarEditorOnDoneHandler;

  /**
   * Return scaled result?
   */
  scaledResult?: boolean;

  /**
   * Width of the editor
   */
  width?: number;

  /**
   * Height of the editor
   */
  height?: number;
}

interface EditorState {
  scale: number;
  rotate: number;
}

const defaultState: EditorState = {
  scale: 1,
  rotate: 0
};

/**
 * User avatar editor
 * https://github.com/mosch/react-avatar-editor
 * @param props Props
 * @returns Component
 */
export function UserAvatarEditor(props: UserAvatarEditorProps) {
  // Destruct
  const {
    border = 30,
    image,
    maxWidth,
    onDone,
    scaledResult = false,
    width = 200,
    height = 200
  } = props;

  // Container width
  const containerWidth = width + 2 * border + 44 + 4;

  // Calculated max width
  const maxWidthCalculated =
    maxWidth == null || maxWidth < 200 ? 3 * width : maxWidth;

  // Labels
  const labels = Labels.UserAvatarEditor;

  // Ref
  const ref = React.createRef<AvatarEditor>();

  // Button ref
  const buttonRef = React.createRef<HTMLButtonElement>();

  // Preview image state
  const [previewImage, setPreviewImage] = React.useState(image);

  // Is ready state
  const [ready, setReady] = React.useState(false);

  // Editor states
  const [editorState, setEditorState] = React.useState(defaultState);

  // Handle zoom
  const handleZoom = (
    _event: Event,
    value: number | number[],
    _activeThumb: number
  ) => {
    const scale = typeof value === "number" ? value : value[0];
    const newState = { ...editorState, scale };
    setEditorState(newState);
  };

  // Handle image load
  const handleLoad = () => {
    setReady(true);
  };

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files == null || files.length == 0) return;

    // Reset all settings
    handleReset();

    // Set new preview image
    setPreviewImage(files[0]);

    // Set ready state
    setReady(false);

    // Make the submit button visible
    buttonRef.current?.scrollIntoView(false);
  };

  // Handle reset
  const handleReset = () => {
    setEditorState({ ...defaultState });
  };

  // Handle rotate
  const handleRotate = (r: number) => {
    let rotate = editorState.rotate + r;
    if (rotate >= 360 || rotate <= -360) rotate = 0;

    const newState = { ...editorState, rotate };
    setEditorState(newState);
  };

  // Handle done
  const handleDone = async () => {
    // Data
    var data = scaledResult
      ? ref.current?.getImageScaledToCanvas()
      : ref.current?.getImage();
    if (data == null) return;

    // pica
    const pica = (await import("pica")).default;
    const picaInstance = pica();

    // toBlob helper
    // Convenience method, similar to canvas.toBlob(), but with promise interface & polyfill for old browsers.
    const toBlob = (
      canvas: HTMLCanvasElement,
      mimeType: string = "image/jpeg",
      quality: number = 1
    ) => {
      return picaInstance.toBlob(canvas, mimeType, quality);
    };

    if (data.width > maxWidthCalculated) {
      // Target height
      const heightCalculated = (height * maxWidthCalculated) / width;

      // Target
      const to = document.createElement("canvas");
      to.width = maxWidthCalculated;
      to.height = heightCalculated;

      // Large photo, resize it
      // https://github.com/nodeca/pica
      picaInstance
        .resize(data, to, {
          unsharpAmount: 160,
          unsharpRadius: 0.6,
          unsharpThreshold: 1
        })
        .then((result) => onDone(result, toBlob));
    } else {
      onDone(data, toBlob);
    }
  };

  // Load the component
  const AE = React.lazy(() => import("react-avatar-editor"));

  return (
    <Stack direction="column" spacing={0.5} width={containerWidth}>
      <Button
        variant="outlined"
        size="medium"
        component="label"
        startIcon={<ComputerIcon />}
        fullWidth
      >
        {labels.upload}
        <input
          id="fileInput"
          type="file"
          accept="image/png, image/jpeg"
          multiple={false}
          hidden
          onChange={handleFileChange}
        />
      </Button>
      <Stack direction="row" spacing={0.5}>
        <React.Suspense
          fallback={
            <Skeleton variant="rounded" width={width} height={height} />
          }
        >
          <AE
            ref={ref}
            border={border}
            width={width}
            height={height}
            onLoadSuccess={handleLoad}
            image={previewImage ?? ""}
            scale={editorState.scale}
            rotate={editorState.rotate}
          />
        </React.Suspense>
        <ButtonGroup size="small" orientation="vertical" disabled={!ready}>
          <Button onClick={() => handleRotate(90)} title={labels.rotateRight}>
            <RotateRightIcon />
          </Button>
          <Button onClick={() => handleRotate(-90)} title={labels.rotateLeft}>
            <RotateLeftIcon />
          </Button>
          <Button onClick={handleReset} title={labels.reset}>
            <ClearAllIcon />
          </Button>
        </ButtonGroup>
      </Stack>
      <Slider
        title={labels.zoom}
        disabled={!ready}
        min={1}
        max={5}
        step={0.01}
        value={editorState.scale}
        onChange={handleZoom}
      />
      <Button
        ref={buttonRef}
        variant="contained"
        startIcon={<DoneIcon />}
        disabled={!ready}
        onClick={handleDone}
      >
        {labels.done}
      </Button>
    </Stack>
  );
}
