import {
  Avatar,
  Divider,
  Drawer,
  IconButton,
  List,
  Typography
} from "@mui/material";
import React from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { DrawerHeader } from "./DrawerHeader";
import { globalApp } from "../app/ReactApp";

/**
 * Left drawer methods
 */
export interface LeftDrawerMethods {
  open(): void;
}

/**
 * Left drawer props
 */
export type LeftDrawerProps = React.PropsWithRef<{
  /**
   * Show when md up
   */
  mdUp: boolean;

  /**
   * Organization
   */
  organization?: number;

  /**
   * Width
   */
  width: number;

  /**
   * Application name
   */
  appName?: string;

  /**
   * Minimize hanlder
   */
  onMinimize?: () => void;
}>;

export const LeftDrawer = React.forwardRef<
  LeftDrawerMethods,
  React.PropsWithChildren<LeftDrawerProps>
>((props, ref) => {
  // Destruct
  const {
    mdUp,
    width,
    appName = globalApp?.get("appName"),
    onMinimize,
    children
  } = props;

  // Menu open/close state
  const [open, setOpen] = React.useState<boolean>();

  const handleDrawerClose = () => {
    if (onMinimize) onMinimize();
    setOpen(false);
  };

  React.useImperativeHandle(ref, () => ({
    open() {
      setOpen(true);
    }
  }));

  // Ready
  React.useEffect(() => {
    setOpen(mdUp);
  }, [mdUp]);

  return (
    <Drawer
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? width : 0,
          boxSizing: "border-box"
        }
      }}
      anchor="left"
      variant={mdUp ? "persistent" : "temporary"}
      open={open}
      onClose={mdUp ? undefined : handleDrawerClose}
      ModalProps={{
        keepMounted: true // Better open performance on mobile.
      }}
    >
      <DrawerHeader>
        <a
          href="https://www.etsoo.com"
          title={globalApp?.get("etsoo") ?? "ETSOO"}
          target="_blank"
          rel="noreferrer"
        >
          <Avatar
            src={process.env.PUBLIC_URL + "/logo192.png"}
            variant="square"
            sx={{ marginLeft: -0.5, marginRight: 1.5, marginBottom: 1 }}
          />
        </a>
        <Typography noWrap component="div" title={appName} sx={{ flexGrow: 2 }}>
          {appName}
        </Typography>
        <IconButton size="small" onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List onClick={mdUp ? undefined : handleDrawerClose}>{children}</List>
    </Drawer>
  );
});
