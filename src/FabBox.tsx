import { Box, BoxProps, Paper, PaperProps, useTheme } from "@mui/material";
import React from "react";

type SharedProps = keyof BoxProps & keyof PaperProps;

/**
 * Fabs container box props
 */
export type FabBoxProps = Pick<BoxProps, SharedProps> &
  Pick<PaperProps, SharedProps> & {
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
    fabPanel = columnDirection,
    itemGap = 1,
    sx,
    ...rest
  } = props;

  // Theme
  const theme = useTheme();
  const spaceGap = theme.spacing(itemGap);

  if (columnDirection == null) return <React.Fragment />;

  return fabPanel ? (
    <Paper
      sx={{
        position: "fixed",
        display: "flex",
        alignItems: "center",
        padding: spaceGap,
        flexDirection: columnDirection ? "column" : "row",
        gap: spaceGap,
        ...sx
      }}
      {...rest}
    />
  ) : (
    <Box
      sx={{
        position: "fixed",
        display: "flex",
        alignItems: "center",
        flexDirection: columnDirection ? "column" : "row",
        gap: spaceGap,
        ...sx
      }}
      {...rest}
    />
  );
}
