import {
  Button,
  ButtonGroup,
  IconButton,
  Skeleton,
  Slider,
  Stack
} from "@mui/material";
import React from "react";
import type AvatarEditor from "react-avatar-editor";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ComputerIcon from "@mui/icons-material/Computer";
import DoneIcon from "@mui/icons-material/Done";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
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
  (
    canvas: HTMLCanvasElement,
    toBlob: UserAvatarEditorToBlob,
    type: string
  ): void;
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

  /**
   * Value range
   */
  range?: [number, number, number];
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
    height = 200,
    range = [0.1, 2, 0.1]
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

  // Image type
  const type = React.useRef<string>("image/jpeg");

  // Button ref
  const buttonRef = React.createRef<HTMLButtonElement>();

  // Preview image state
  const [previewImage, setPreviewImage] = React.useState(image);

  // Is ready state
  const [ready, setReady] = React.useState(false);

  // Editor states
  const [editorState, setEditorState] = React.useState(defaultState);

  // Range
  const [min, max, step] = range;
  const marks = [
    {
      value: min,
      label: min.toString()
    },
    {
      value: max,
      label: max.toString()
    }
  ];

  if (min < 1) {
    marks.splice(1, 0, { value: 1, label: "1" });
  }

  // Handle zoom
  const handleZoom = (
    _event: Event,
    value: number | number[],
    _activeThumb: number
  ) => {
    const scale = typeof value === "number" ? value : value[0];
    setScale(scale);
  };

  const setScale = (scale: number) => {
    const newState = { ...editorState, scale };
    setEditorState(newState);
  };

  const adjustScale = (isAdd: boolean) => {
    setScale(editorState.scale + (isAdd ? step : -step));
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
    const file = files[0];
    type.current = file.type;
    setPreviewImage(file);

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
      mimeType: string = type.current,
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
        .then((result) => onDone(result, toBlob, type.current));
    } else {
      onDone(data, toBlob, type.current);
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
      <Stack
        spacing={0.5}
        direction="row"
        sx={{ paddingBottom: 2 }}
        alignItems="center"
      >
        <IconButton
          size="small"
          disabled={!ready || editorState.scale <= min}
          onClick={() => adjustScale(false)}
        >
          <RemoveIcon />
        </IconButton>
        <Slider
          title={labels.zoom}
          disabled={!ready}
          min={min}
          max={max}
          step={step}
          value={editorState.scale}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${Math.round(100 * value) / 100}`}
          marks={marks}
          onChange={handleZoom}
        />
        <IconButton
          size="small"
          disabled={!ready || editorState.scale >= max}
          onClick={() => adjustScale(true)}
        >
          <AddIcon />
        </IconButton>
      </Stack>
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
