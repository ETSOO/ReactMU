import Stack, { StackProps } from "@mui/material/Stack";

/**
 * Horizonal box
 * @param props Props
 * @returns Component
 */
export function HBox(props: Omit<StackProps, "ref" | "direction">) {
  return <Stack direction="row" {...props} />;
}

/**
 * Horizonal box with list items
 * @param props Props
 * @returns Component
 */
export function HBoxList(props: Omit<StackProps, "direction">) {
  const { sx, ...rest } = props;

  return (
    <Stack
      spacing={1}
      direction="row"
      sx={{ flexWrap: "wrap", ...sx }}
      {...rest}
    />
  );
}

/**
 * Vertial box
 * @param props Props
 * @returns Component
 */
export function VBox(props: Omit<StackProps, "ref" | "direction">) {
  return <Stack direction="column" {...props} />;
}
