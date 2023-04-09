import { Box, BoxProps, Paper, useTheme } from "@mui/material";
import React from "react";

/**
 * Fabs container box props
 */
export type FabBoxProps = BoxProps & {
  /**
   * Item gap
   */
  itemGap?: number;

  /**
   * Flex direction, row or column
   */
  columnDirection?: boolean;

  /**
   * Add panel to the Fab
   */
  fabPanel?: boolean;
};

/**
 * Fabs container box
 * @param props Props
 * @returns Component
 */
export function FabBox(props: FabBoxProps) {
  // Destruct
  const {
    columnDirection,
    fabPanel = columnDirection === false ? true : false,
    itemGap = 1,
    sx,
    ...rest
  } = props;

  // Theme
  const theme = useTheme();
  const spaceGap = theme.spacing(itemGap);

  if (columnDirection == null) return <React.Fragment />;

  // margin
  const margin = columnDirection
    ? { marginTop: spaceGap }
    : { marginLeft: spaceGap };

  const box = (
    <Box
      sx={{
        position: "fixed",
        display: "flex",
        alignItems: "center",
        flexDirection: columnDirection ? "column" : "row",
        "& > :not(style) + :not(style)": margin,
        ...sx
      }}
      {...rest}
    />
  );

  return fabPanel ? <Paper sx={{ padding: spaceGap }}>{box}</Paper> : box;
}
