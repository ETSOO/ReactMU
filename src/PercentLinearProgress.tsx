import {
  Box,
  LinearProgress,
  LinearProgressProps,
  Typography,
  TypographyProps
} from "@mui/material";
import React from "react";

export type PercentLinearProgressProps = LinearProgressProps & {
  value: number;
  valueUnit?: string;
  textProps?: TypographyProps;
};

export function PercentLinearProgress(props: PercentLinearProgressProps) {
  // Destruct
  const { textProps, valueUnit = "%", ...rest } = props;

  // Component
  return (
    <Box sx={{ display: "flex", alignItems: "center", flexGrow: 2 }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...rest} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          {...textProps}
        >{`${Math.round(props.value)}${valueUnit}`}</Typography>
      </Box>
    </Box>
  );
}
