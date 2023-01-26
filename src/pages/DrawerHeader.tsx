import { styled } from "@mui/material";

/**
 * Common drawer header
 */
export const DrawerHeader = styled("div")(({ theme }) => ({
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(0, 1, 0, 2),
  justifyContent: "flex-start"
}));
