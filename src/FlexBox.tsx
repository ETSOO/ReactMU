import Stack, { StackProps } from "@mui/material/Stack";

/**
 * Horizonal box
 * @param props Props
 * @returns Component
 */
export function HBox(props: Omit<StackProps, "ref">) {
  return <Stack direction="row" width="100%" {...props} />;
}

/**
 * Horizonal box with list items
 * @param props Props
 * @returns Component
 */
export function HBoxList(props: Omit<StackProps, "direction">) {
  return (
    <Stack
      spacing={1}
      gap={1}
      direction="row"
      flexWrap="wrap"
      width="100%"
      {...props}
    />
  );
}

/**
 * Vertial box
 * @param props Props
 * @returns Component
 */
export function VBox(props: Omit<StackProps, "ref">) {
  return <Stack direction="column" {...props} />;
}
