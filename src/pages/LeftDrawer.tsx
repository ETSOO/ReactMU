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
   * Is open or not
   */
  open?: boolean;

  /**
   * Minimize hanlder
   */
  onMinimize?: () => void;
}>;

export function LeftDrawer(props: React.PropsWithChildren<LeftDrawerProps>) {
  // Destruct
  const {
    mdUp,
    width,
    appName = globalApp?.get("appName"),
    onMinimize,
    open = mdUp,
    children
  } = props;

  // Menu open/close state
  const [openLocal, setOpen] = React.useState<boolean>();

  const handleDrawerClose = () => {
    if (onMinimize) onMinimize();
    setOpen(false);
  };

  // Ready
  React.useEffect(() => {
    setOpen(open);
  }, [open]);

  return (
    <Drawer
      hidden={!openLocal}
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box"
        }
      }}
      anchor="left"
      variant={mdUp ? "persistent" : "temporary"}
      open={open}
      transitionDuration={0}
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
}
