import { Box, BoxProps, useTheme } from "@mui/material";
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
};

/**
 * Fabs container box
 * @param props Props
 * @returns Component
 */
export function FabBox(props: FabBoxProps) {
  // Destruct
  const { columnDirection, itemGap = 1, sx, ...rest } = props;

  // Theme
  const theme = useTheme();
  const spaceGap = theme.spacing(itemGap);

  if (columnDirection == null) return <React.Fragment />;

  // margin
  const margin = columnDirection
    ? { marginTop: spaceGap }
    : { marginLeft: spaceGap };

  return (
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
}
