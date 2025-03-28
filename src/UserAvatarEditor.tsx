import React from "react";
import type AvatarEditor from "react-avatar-editor";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ImageIcon from "@mui/icons-material/Image";
import DoneIcon from "@mui/icons-material/Done";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { Labels } from "./app/Labels";
import { FileUploadButton } from "./FileUploadButton";
import { ImageState } from "react-avatar-editor";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";

const defaultSize = 300;

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
  ): Promise<void | true | undefined>;
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
   * Select file label
   */
  selectFileLabel?: string;

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
  // Labels
  const labels = Labels.UserAvatarEditor;

  // Destruct
  const {
    border = 30,
    image,
    maxWidth,
    onDone,
    scaledResult = false,
    width = defaultSize,
    height = defaultSize,
    range = [0.1, 2, 0.1],
    selectFileLabel = labels.selectFile + "..."
  } = props;

  // Container width
  const containerWidth = width + 2 * border + 44 + 4;

  // Calculated max width
  const maxWidthCalculated =
    maxWidth == null || maxWidth < defaultSize ? 2 * width : maxWidth;

  // Ref
  const ref = React.createRef<AvatarEditor>();

  // Image type
  const type = React.useRef<string>("image/jpeg");

  // Button ref
  const buttonRef = React.createRef<HTMLButtonElement>();

  // Preview image state
  const [previewImage, setPreviewImage] = React.useState(image);

  React.useEffect(() => setPreviewImage(image), [image]);

  // Is ready state
  const [ready, setReady] = React.useState(false);

  // Editor states
  const [editorState, setEditorState] = React.useState(defaultState);

  // Height
  // noHeight: height is not set and will be updated dynamically
  const noHeight = height <= 0;
  const [localHeight, setHeight] = React.useState(
    noHeight ? defaultSize : height
  );

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
  const handleLoad = (imageInfo: ImageState) => {
    // Ignore too small images
    if (imageInfo.resource.width < 10 || imageInfo.resource.height < 10) return;

    if (noHeight) {
      setHeight((imageInfo.height * width) / imageInfo.width);
    }
    setReady(true);
  };

  // Handle file upload
  const handleFileUpload = (files: FileList) => {
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

  const resetUI = () => {
    setReady(false);
    setPreviewImage(undefined);
    handleReset();
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
      const heightCalculated = (localHeight * maxWidthCalculated) / width;

      // Target
      const to = document.createElement("canvas");
      to.width = maxWidthCalculated;
      to.height = heightCalculated;

      // Large photo, resize it
      // https://github.com/nodeca/pica
      const canvas = await picaInstance.resize(data, to, {
        unsharpAmount: 160,
        unsharpRadius: 0.6,
        unsharpThreshold: 1
      });

      const result = await onDone(canvas, toBlob, type.current);
      if (result) {
        resetUI();
      }
    } else {
      const result = await onDone(data, toBlob, type.current);
      if (result) {
        resetUI();
      }
    }
  };

  // Load the component
  const AE = React.lazy(() => import("react-avatar-editor"));

  return (
    <Stack direction="column" spacing={0.5} width={containerWidth}>
      <FileUploadButton
        variant="outlined"
        size="medium"
        startIcon={<ImageIcon />}
        fullWidth
        onUploadFiles={handleFileUpload}
        inputProps={{ multiple: false, accept: "image/png, image/jpeg" }}
      >
        {selectFileLabel}
      </FileUploadButton>
      <Stack direction="row" spacing={0.5}>
        <React.Suspense
          fallback={
            <Skeleton variant="rounded" width={width} height={localHeight} />
          }
        >
          <AE
            ref={ref}
            border={border}
            width={width}
            height={localHeight}
            onLoadSuccess={handleLoad}
            image={
              previewImage ??
              "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
            }
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
