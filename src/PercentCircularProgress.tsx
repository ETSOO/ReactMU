import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Typography,
  TypographyProps
} from "@mui/material";
import React from "react";

export type PercentCircularProgressProps = CircularProgressProps & {
  value: number;
  valueUnit?: string;
  textProps?: TypographyProps<"div">;
};

export function PercentCircularProgress(props: PercentCircularProgressProps) {
  // Destruct
  const { textProps, valueUnit = "%", ...rest } = props;

  // Component
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...rest} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          {...textProps}
        >{`${Math.round(props.value)}${valueUnit}`}</Typography>
      </Box>
    </Box>
  );
}
