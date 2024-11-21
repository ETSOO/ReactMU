import { ListItemIcon, styled } from "@mui/material";

/**
 * List item right icon component
 */
export const ListItemRightIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: "20px!important",
  paddingLeft: theme.spacing(2)
})) as typeof ListItemIcon;
